package com.syncpace.backend.controller;

import com.syncpace.backend.model.Notification;
import com.syncpace.backend.model.User;
import com.syncpace.backend.repository.NotificationRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepo notificationRepo;

    public NotificationController(NotificationRepo notificationRepo) {
        this.notificationRepo = notificationRepo;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationRepo.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@AuthenticationPrincipal User user) {
        long count = notificationRepo.countByUserIdAndReadFalse(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@AuthenticationPrincipal User user, @PathVariable String id) {
        Notification notification = notificationRepo.findById(id).orElse(null);
        if (notification == null) {
            return ResponseEntity.notFound().build();
        }
        if (!notification.getUserId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        notification.setRead(true);
        notificationRepo.save(notification);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal User user) {
        List<Notification> notifications = notificationRepo.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (Notification n : notifications) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepo.save(n);
            }
        }
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @DeleteMapping
    public ResponseEntity<?> clearAll(@AuthenticationPrincipal User user) {
        notificationRepo.deleteByUserId(user.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications cleared"));
    }
}
