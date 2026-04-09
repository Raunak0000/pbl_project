package com.syncpace.backend.controller;

import com.syncpace.backend.model.Task;
import com.syncpace.backend.model.TaskStatus;
import com.syncpace.backend.model.User;
import com.syncpace.backend.repository.BoardRepo;
import com.syncpace.backend.repository.TaskRepo;
import com.syncpace.backend.service.TaskService;

import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
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

    // REPLACE WITH THIS:
    public TaskController(TaskService taskService, BoardRepo boardRepo, TaskRepo taskRepo,
            ActivityLogRepo activityLogRepo) {
        this.taskService = taskService;
        this.boardRepo = boardRepo;
        this.taskRepo = taskRepo;
        this.activityLogRepo = activityLogRepo;
    }

    /**
     * Verifies that the given board belongs to the authenticated user.
     * Returns true if the board exists and is owned by the user, false otherwise.
     */
    private boolean boardExists(String boardId, User user) {
        return boardRepo.findByIdAndUserId(boardId, user.getId()).isPresent();
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<?> getTasksForBoard(
            @AuthenticationPrincipal User user,
            @PathVariable String boardId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        if (!boardExists(boardId, user)) {
            return ResponseEntity.status(403).body("Board not found or access denied");
        }
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(taskRepo.findByBoardId(boardId, pageable));
    }

    @PostMapping
    public ResponseEntity<?> createTask(@AuthenticationPrincipal User user,
            @RequestBody Task task) {
        if (!boardExists(task.getBoardId(), user)) {
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
        if (!boardExists(boardId, user)) {
            return ResponseEntity.status(403).body("Board not found or access denied");
        }
        return ResponseEntity.ok(taskService.updateTask(taskId, task, user));
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(@AuthenticationPrincipal User user, @PathVariable String taskId,
            @RequestParam String status) {
        Task existingTask = taskService.getTaskById(taskId);
        if (existingTask == null)
            return ResponseEntity.notFound().build();
        if (!boardExists(existingTask.getBoardId(), user)) {
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
        if (!boardExists(existingTask.getBoardId(), user)) {
            return ResponseEntity.status(403).body("Board not found or access denied");
        }
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
        if (!boardExists(task.getBoardId(), currentUser)) {
            return ResponseEntity.status(403).body("Board not found or access denied");
        }

        var pageable = org.springframework.data.domain.PageRequest.of(
                page, size,
                org.springframework.data.domain.Sort.by("timestamp").descending());

        return ResponseEntity.ok(
                activityLogRepo.findByTaskIdOrderByTimestampDesc(taskId, pageable).getContent());
    }
}