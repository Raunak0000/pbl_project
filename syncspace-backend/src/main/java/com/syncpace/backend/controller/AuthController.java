package com.syncpace.backend.controller;

import com.syncpace.backend.config.JwtService;
import com.syncpace.backend.dto.LoginRequest;
import com.syncpace.backend.dto.RegisterRequest;
import com.syncpace.backend.model.AppCounter;
import com.syncpace.backend.model.User;
import com.syncpace.backend.repository.UserRepo;

import jakarta.validation.Valid;

import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepo userRepo;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final MongoTemplate mongoTemplate;

    private final ConcurrentHashMap<String, long[]> loginAttempts = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = 15 * 60 * 1000;

    public AuthController(UserRepo userRepo, JwtService jwtService,
            BCryptPasswordEncoder passwordEncoder, MongoTemplate mongoTemplate) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.mongoTemplate = mongoTemplate;
    }

    private boolean isRateLimited(String ip) {
        long now = Instant.now().toEpochMilli();
        loginAttempts.compute(ip, (key, val) -> {
            if (val == null || now - val[1] > WINDOW_MS) {
                return new long[] { 1, now };
            }
            val[0]++;
            return val;
        });
        long[] attempts = loginAttempts.get(ip);
        return attempts[0] > MAX_ATTEMPTS;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String username = request.getUsername();
        String email = request.getEmail();
        String password = request.getPassword();

        if (userRepo.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already taken"));
        }
        if (userRepo.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        // Atomic first-user-becomes-admin check
        AppCounter counter = mongoTemplate.findAndModify(
                Query.query(Criteria.where("_id").is("userCount")),
                new Update().inc("userCount", 1).setOnInsert("_id", "userCount"),
                FindAndModifyOptions.options().returnNew(true).upsert(true),
                AppCounter.class);

        boolean isFirstUser = counter != null && counter.getUserCount() == 1;
        user.setRole(isFirstUser ? User.Role.ADMIN : User.Role.USER);

        User savedUser = userRepo.save(user);
        String token = jwtService.generateToken(savedUser);

        return ResponseEntity.ok(buildAuthResponse(savedUser, token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();

        if (isRateLimited(ip)) {
            return ResponseEntity.status(429).body(Map.of(
                    "message", "Too many login attempts. Please try again in 15 minutes."));
        }

        String username = request.getUsername();
        String password = request.getPassword();

        var userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }

        loginAttempts.remove(ip);

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(buildAuthResponse(user, token));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @AuthenticationPrincipal User user,
            jakarta.servlet.http.HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            jwtService.invalidateToken(token);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    private Map<String, Object> buildAuthResponse(User user, String token) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole().name());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", userMap);

        return response;
    }
}