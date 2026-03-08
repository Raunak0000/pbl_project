package com.syncpace.backend.service;

import com.syncpace.backend.model.Task;
import com.syncpace.backend.repository.TaskRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepo taskRepo;

    // Standard Constructor Injection (Fixes the error)
    public TaskService(TaskRepo taskRepo) {
        this.taskRepo = taskRepo;
    }

    public List<Task> getTasksByBoard(String boardId) {
        return taskRepo.findByBoardId(boardId);
    }

    public Task createTask(Task task) {
        return taskRepo.save(task);
    }

    public Task updateTaskStatus(String taskId, String newStatus) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // ENFORCE PROJECT MANAGEMENT RULES (Blocker Logic)
        if ("Done".equalsIgnoreCase(newStatus) && task.getBlockedBy() != null && !task.getBlockedBy().isEmpty()) {
            for (String blockerId : task.getBlockedBy()) {
                Task blocker = taskRepo.findById(blockerId)
                        .orElseThrow(() -> new RuntimeException("Blocking task not found"));

                if (!"Done".equalsIgnoreCase(blocker.getStatus())) {
                    throw new IllegalStateException("Cannot complete task. Blocked by: " + blocker.getTitle());
                }
            }
        }

        task.setStatus(newStatus);
        return taskRepo.save(task);
    }

    public void deleteTask(String taskId) {
        taskRepo.deleteById(taskId);
    }
}