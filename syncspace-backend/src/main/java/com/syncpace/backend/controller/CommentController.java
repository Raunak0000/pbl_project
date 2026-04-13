package com.syncpace.backend.controller;

import com.syncpace.backend.model.Comment;
import com.syncpace.backend.model.Notification;
import com.syncpace.backend.model.Task;
import com.syncpace.backend.model.User;
import com.syncpace.backend.repository.CommentRepo;
import com.syncpace.backend.repository.NotificationRepo;
import com.syncpace.backend.repository.TaskRepo;
import com.syncpace.backend.repository.UserRepo;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
public class CommentController {

    private final CommentRepo commentRepo;
    private final SimpMessagingTemplate messagingTemplate;
    private final TaskRepo taskRepo;
    private final UserRepo userRepo;
    private final NotificationRepo notificationRepo;

    public CommentController(CommentRepo commentRepo, SimpMessagingTemplate messagingTemplate,
                             TaskRepo taskRepo, UserRepo userRepo, NotificationRepo notificationRepo) {
        this.commentRepo = commentRepo;
        this.messagingTemplate = messagingTemplate;
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
        this.notificationRepo = notificationRepo;
    }

    @GetMapping
    public ResponseEntity<List<Comment>> getComments(@PathVariable String taskId) {
        return ResponseEntity.ok(commentRepo.findByTaskIdOrderByCreatedAtAsc(taskId));
    }

    @PostMapping
    public ResponseEntity<Comment> addComment(
            @AuthenticationPrincipal User user,
            @PathVariable String taskId,
            @RequestBody Map<String, String> body) {

        Comment comment = new Comment();
        comment.setTaskId(taskId);
        comment.setBoardId(body.get("boardId"));
        comment.setUserId(user.getId());
        comment.setUsername(user.getUsername());
        comment.setContent(body.get("content"));
        comment.setCreatedAt(LocalDateTime.now());

        Comment saved = commentRepo.save(comment);

        // Broadcast via WebSocket for live-editing
        Map<String, Object> event = new HashMap<>();
        event.put("type", "COMMENT_ADDED");
        Map<String, Object> payload = new HashMap<>();
        payload.put("taskId", taskId);
        payload.put("boardId", body.get("boardId"));
        payload.put("comment", saved);
        payload.put("userId", user.getId());
        event.put("payload", payload);
        messagingTemplate.convertAndSend("/topic/live-editing", (Object) event);

        // Check if we need to send a notification
        Task task = taskRepo.findById(taskId).orElse(null);
        if (task != null && task.getAssignee() != null && !task.getAssignee().trim().isEmpty() 
            && !task.getAssignee().equals(user.getUsername())) {
            
            User assignee = userRepo.findByUsername(task.getAssignee()).orElse(null);
            if (assignee != null) {
                Notification notif = new Notification();
                notif.setUserId(assignee.getId());
                notif.setTaskId(taskId);
                notif.setBoardId(task.getBoardId());
                notif.setType("COMMENT");
                notif.setMessage(user.getUsername() + " commented on '" + task.getTitle() + "'");
                notif.setCreatedAt(LocalDateTime.now());
                
                Notification savedNotif = notificationRepo.save(notif);
                
                Map<String, Object> notifEvent = new HashMap<>();
                notifEvent.put("type", "NOTIFICATION_ADDED");
                notifEvent.put("payload", savedNotif);
                
                messagingTemplate.convertAndSend("/topic/notifications/" + assignee.getId(), (Object) notifEvent);
            }
        }

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @AuthenticationPrincipal User user,
            @PathVariable String taskId,
            @PathVariable String commentId) {

        Comment comment = commentRepo.findById(commentId).orElse(null);
        if (comment == null) {
            return ResponseEntity.notFound().build();
        }

        // Only the comment owner can delete
        if (!user.getId().equals(comment.getUserId())) {
            return ResponseEntity.status(403).body(Map.of("message", "You can only delete your own comments"));
        }

        commentRepo.deleteById(commentId);

        // Broadcast via WebSocket
        Map<String, Object> event = new HashMap<>();
        event.put("type", "COMMENT_DELETED");
        Map<String, Object> payload = new HashMap<>();
        payload.put("taskId", taskId);
        payload.put("boardId", comment.getBoardId());
        payload.put("commentId", commentId);
        payload.put("userId", user.getId());
        event.put("payload", payload);
        messagingTemplate.convertAndSend("/topic/live-editing", (Object) event);

        return ResponseEntity.ok(Map.of("message", "Comment deleted"));
    }
}
