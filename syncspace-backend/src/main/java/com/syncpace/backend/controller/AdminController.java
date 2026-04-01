package com.syncpace.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.syncpace.backend.model.User;
import com.syncpace.backend.repository.UserRepo;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepo userRepo;

    public AdminController(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepo.findAll());
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String userId) {
        if (currentUser.getId().equals(userId)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "You cannot delete your own account"));
        }
        if (!userRepo.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }
        userRepo.deleteById(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
