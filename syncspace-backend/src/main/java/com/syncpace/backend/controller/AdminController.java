package com.syncpace.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.syncpace.backend.model.User;
import com.syncpace.backend.repository.UserRepo;
import com.syncpace.backend.model.ActivityLog;
import com.syncpace.backend.repository.ActivityLogRepo;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepo userRepo;
    private final ActivityLogRepo activityLogRepo;

    public AdminController(UserRepo userRepo, ActivityLogRepo activityLogRepo) {
        this.userRepo = userRepo;
        this.activityLogRepo = activityLogRepo;
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

    @GetMapping("/boards/{boardId}/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActivityLog>> getBoardLogs(
            @PathVariable String boardId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        var pageable = org.springframework.data.domain.PageRequest.of(
                page, size,
                org.springframework.data.domain.Sort.by("timestamp").descending());

        return ResponseEntity.ok(
                activityLogRepo.findByBoardIdOrderByTimestampDesc(boardId, pageable).getContent());
    }
}
