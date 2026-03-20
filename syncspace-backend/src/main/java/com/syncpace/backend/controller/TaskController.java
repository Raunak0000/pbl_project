package com.syncpace.backend.controller;

import com.syncpace.backend.model.Task;
import com.syncpace.backend.model.TaskStatus;
import com.syncpace.backend.model.User;
import com.syncpace.backend.repository.BoardRepo;
import com.syncpace.backend.service.TaskService;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final BoardRepo boardRepo;

    public TaskController(TaskService taskService, BoardRepo boardRepo) {
        this.taskService = taskService;
        this.boardRepo = boardRepo;
    }

    /**
     * Verifies that the given board belongs to the authenticated user.
     * Returns true if the board exists and is owned by the user, false otherwise.
     */
    private boolean isBoardOwnedByUser(String boardId, User user) {
        return boardRepo.findByIdAndUserId(boardId, user.getId()).isPresent();
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<?> getTasksForBoard(@AuthenticationPrincipal User user,
            @PathVariable String boardId) {
        if (!isBoardOwnedByUser(boardId, user)) {
            return ResponseEntity.status(403).body("Board not found or access denied");
        }
        return ResponseEntity.ok(taskService.getTasksByBoard(boardId));
    }

    @PostMapping
    public ResponseEntity<?> createTask(@AuthenticationPrincipal User user,
            @RequestBody Task task) {
        if (!isBoardOwnedByUser(task.getBoardId(), user)) {
            return ResponseEntity.status(403).body("Board not found or access denied");
        }
        return ResponseEntity.ok(taskService.createTask(task));
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
        if (!isBoardOwnedByUser(boardId, user)) {
            return ResponseEntity.status(403).body("Board not found or access denied");
        }
        return ResponseEntity.ok(taskService.updateTask(taskId, task));
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable String taskId, @RequestParam String status) {
        try {
            TaskStatus taskStatus = TaskStatus.valueOf(status.toUpperCase().replace(" ", "_"));
            Task updatedTask = taskService.updateTaskStatus(taskId, taskStatus);
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
        if (!isBoardOwnedByUser(existingTask.getBoardId(), user)) {
            return ResponseEntity.status(403).body("Board not found or access denied");
        }
        taskService.deleteTask(taskId);
        return ResponseEntity.ok().build();
    }
}