package com.syncpace.backend.controller;

import com.syncpace.backend.model.Notification;
import com.syncpace.backend.model.Task;
import com.syncpace.backend.model.TaskStatus;
import com.syncpace.backend.model.User;
import com.syncpace.backend.repository.BoardRepo;
import com.syncpace.backend.repository.CommentRepo;
import com.syncpace.backend.repository.NotificationRepo;
import com.syncpace.backend.repository.TaskRepo;
import com.syncpace.backend.repository.UserRepo;
import com.syncpace.backend.service.TaskService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.syncpace.backend.repository.ActivityLogRepo;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final BoardRepo boardRepo;
    private final TaskRepo taskRepo;
    private final ActivityLogRepo activityLogRepo;
    private final CommentRepo commentRepo;
    private final UserRepo userRepo;
    private final NotificationRepo notificationRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public TaskController(TaskService taskService, BoardRepo boardRepo, TaskRepo taskRepo,
            ActivityLogRepo activityLogRepo, CommentRepo commentRepo, UserRepo userRepo,
            NotificationRepo notificationRepo, SimpMessagingTemplate messagingTemplate) {
        this.taskService = taskService;
        this.boardRepo = boardRepo;
        this.taskRepo = taskRepo;
        this.activityLogRepo = activityLogRepo;
        this.commentRepo = commentRepo;
        this.userRepo = userRepo;
        this.notificationRepo = notificationRepo;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Verifies that the given board exists.
     * Collaborative model: any authenticated user can access any board.
     */
    private boolean boardExists(String boardId) {
        return boardRepo.existsById(boardId);
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<?> getTasksForBoard(
            @AuthenticationPrincipal User user,
            @PathVariable String boardId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        if (!boardExists(boardId)) {
            return ResponseEntity.status(403).body("Board not found or access denied");
        }
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(taskRepo.findByBoardId(boardId, pageable));
    }

    @PostMapping
    public ResponseEntity<?> createTask(@AuthenticationPrincipal User user,
            @RequestBody Task task) {
        if (!boardExists(task.getBoardId())) {
            return ResponseEntity.status(403).body("Board not found or access denied");
        }
        return ResponseEntity.ok(taskService.createTask(task, user));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<?> updateTask(@AuthenticationPrincipal User user,
            @PathVariable String taskId,
            @RequestBody Task task) {
        // Look up the existing task to get its boardId for the ownership check
        String boardId = task.getBoardId();
        if (boardId == null) {
            // If boardId not provided in the request body, look up the existing task
            Task existingTask = taskService.getTaskById(taskId);
            if (existingTask == null) {
                return ResponseEntity.notFound().build();
            }
            boardId = existingTask.getBoardId();
        }
        if (!boardExists(boardId)) {
            return ResponseEntity.status(403).body("Board not found or access denied");
        }
        
        Task existingTask = taskService.getTaskById(taskId);
        String oldAssignee = existingTask != null ? existingTask.getAssignee() : null;
        String newAssignee = task.getAssignee();

        Task updated = taskService.updateTask(taskId, task, user);

        // Notify if assignee changed and is not blank
        if (newAssignee != null && !newAssignee.trim().isEmpty() && !newAssignee.equals(oldAssignee) && !newAssignee.equals(user.getUsername())) {
            User assigneeUser = userRepo.findByUsername(newAssignee).orElse(null);
            if (assigneeUser != null) {
                Notification notif = new Notification();
                notif.setUserId(assigneeUser.getId());
                notif.setTaskId(taskId);
                notif.setBoardId(boardId);
                notif.setType("ASSIGNED");
                notif.setMessage("You were assigned to '" + updated.getTitle() + "'");
                notif.setCreatedAt(LocalDateTime.now());
                
                Notification savedNotif = notificationRepo.save(notif);
                
                Map<String, Object> notifEvent = new HashMap<>();
                notifEvent.put("type", "NOTIFICATION_ADDED");
                notifEvent.put("payload", savedNotif);
                
                messagingTemplate.convertAndSend("/topic/notifications/" + assigneeUser.getId(), (Object) notifEvent);
            }
        }

        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(@AuthenticationPrincipal User user, @PathVariable String taskId,
            @RequestParam String status) {
        Task existingTask = taskService.getTaskById(taskId);
        if (existingTask == null)
            return ResponseEntity.notFound().build();
        if (!boardExists(existingTask.getBoardId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Board not found or access denied"));
        }
        try {
            TaskStatus taskStatus = TaskStatus.fromLabel(status);
            Task updatedTask = taskService.updateTaskStatus(taskId, taskStatus, user);
            return ResponseEntity.ok(updatedTask);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status: " + status));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(@AuthenticationPrincipal User user,
            @PathVariable String taskId) {
        // Look up the task to get its boardId for the ownership check
        Task existingTask = taskService.getTaskById(taskId);
        if (existingTask == null) {
            return ResponseEntity.notFound().build();
        }
        if (!boardExists(existingTask.getBoardId())) {
            return ResponseEntity.status(403).body("Board not found or access denied");
        }
        commentRepo.deleteByTaskId(taskId);
        taskService.deleteTask(taskId, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{taskId}/logs")
    public ResponseEntity<?> getTaskLogs(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String taskId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Task task = taskService.getTaskById(taskId);
        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        // Reuse the same ownership pattern already used in this controller
        if (!boardExists(task.getBoardId())) {
            return ResponseEntity.status(403).body("Board not found or access denied");
        }

        var pageable = org.springframework.data.domain.PageRequest.of(
                page, size,
                org.springframework.data.domain.Sort.by("timestamp").descending());

        return ResponseEntity.ok(
                activityLogRepo.findByTaskIdOrderByTimestampDesc(taskId, pageable).getContent());
    }
}