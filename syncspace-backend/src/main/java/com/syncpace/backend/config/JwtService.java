package com.syncpace.backend.config;

import com.syncpace.backend.model.InvalidatedToken;
import com.syncpace.backend.model.User;
import com.syncpace.backend.repository.InvalidatedTokenRepo;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final InvalidatedTokenRepo invalidatedTokenRepo;

    public JwtService(InvalidatedTokenRepo invalidatedTokenRepo) {
        this.invalidatedTokenRepo = invalidatedTokenRepo;
    }

    public void invalidateToken(String token) {
        Date expiry = extractAllClaims(token).getExpiration();
        invalidatedTokenRepo.save(new InvalidatedToken(token, expiry));
    }

    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return !invalidatedTokenRepo.existsByToken(token); // check blocklist
        } catch (Exception e) {
            return false;
        }
    }

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("role", user.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
