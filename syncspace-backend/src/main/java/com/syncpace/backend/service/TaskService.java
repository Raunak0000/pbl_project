package com.syncpace.backend.service;

import com.syncpace.backend.model.ActivityAction;
import com.syncpace.backend.model.ActivityLog;
import com.syncpace.backend.model.Task;
import com.syncpace.backend.model.TaskStatus;
import com.syncpace.backend.model.User;
import com.syncpace.backend.repository.ActivityLogRepo;
import com.syncpace.backend.repository.TaskRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    // REPLACE WITH THIS:
    private final TaskRepo taskRepo;
    private final ActivityLogRepo activityLogRepo;

    public TaskService(TaskRepo taskRepo, ActivityLogRepo activityLogRepo) {
        this.taskRepo = taskRepo;
        this.activityLogRepo = activityLogRepo;
    }

    public List<Task> getTasksByBoard(String boardId) {
        return taskRepo.findByBoardId(boardId);
    }

    public Task getTaskById(String taskId) {
        return taskRepo.findById(taskId).orElse(null);
    }

    // REPLACE WITH THIS:
    public Task createTask(Task task, User currentUser) {
        Task saved = taskRepo.save(task);
        logActivity(saved.getId(), saved.getBoardId(), currentUser,
                ActivityAction.TASK_CREATED, null, saved.getTitle());
        return saved;
    }

    // REPLACE WITH THIS:
    public Task updateTask(String taskId, Task updatedTask, User currentUser) {
        Task existingTask = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (updatedTask.getTitle() != null && !updatedTask.getTitle().equals(existingTask.getTitle())) {
            logActivity(taskId, existingTask.getBoardId(), currentUser,
                    ActivityAction.TITLE_CHANGED, existingTask.getTitle(), updatedTask.getTitle());
            existingTask.setTitle(updatedTask.getTitle());
        }
        if (updatedTask.getDescription() != null
                && !updatedTask.getDescription().equals(existingTask.getDescription())) {
            logActivity(taskId, existingTask.getBoardId(), currentUser,
                    ActivityAction.DESCRIPTION_CHANGED, "[previous description]", "[updated description]");
            existingTask.setDescription(updatedTask.getDescription());
        }
        if (updatedTask.getStatus() != null && !updatedTask.getStatus().equals(existingTask.getStatus())) {
            logActivity(taskId, existingTask.getBoardId(), currentUser,
                    ActivityAction.STATUS_CHANGED,
                    existingTask.getStatus() != null ? existingTask.getStatus().name() : null,
                    updatedTask.getStatus().name());
            existingTask.setStatus(updatedTask.getStatus());
        }
        if (updatedTask.getAssignee() != null && !updatedTask.getAssignee().equals(existingTask.getAssignee())) {
            logActivity(taskId, existingTask.getBoardId(), currentUser,
                    ActivityAction.ASSIGNEE_CHANGED, existingTask.getAssignee(), updatedTask.getAssignee());
            existingTask.setAssignee(updatedTask.getAssignee());
        }
        if (updatedTask.getDueDate() != null && !updatedTask.getDueDate().equals(existingTask.getDueDate())) {
            logActivity(taskId, existingTask.getBoardId(), currentUser,
                    ActivityAction.DUE_DATE_CHANGED, existingTask.getDueDate(), updatedTask.getDueDate());
            existingTask.setDueDate(updatedTask.getDueDate());
        }
        if (updatedTask.getTags() != null && !updatedTask.getTags().equals(existingTask.getTags())) {
            logActivity(taskId, existingTask.getBoardId(), currentUser,
                    ActivityAction.TAGS_CHANGED,
                    existingTask.getTags() != null ? existingTask.getTags().toString() : null,
                    updatedTask.getTags().toString());
            existingTask.setTags(updatedTask.getTags());
        }
        if (updatedTask.getTeam() != null && !updatedTask.getTeam().equals(existingTask.getTeam())) {
            existingTask.setTeam(updatedTask.getTeam());
        }
        if (updatedTask.getBlockedBy() != null && !updatedTask.getBlockedBy().equals(existingTask.getBlockedBy())) {
            logActivity(taskId, existingTask.getBoardId(), currentUser,
                    ActivityAction.BLOCKED_BY_CHANGED,
                    existingTask.getBlockedBy() != null ? existingTask.getBlockedBy().toString() : null,
                    updatedTask.getBlockedBy().toString());
            existingTask.setBlockedBy(updatedTask.getBlockedBy());
        }

        return taskRepo.save(existingTask);
    }

    // REPLACE WITH THIS:
    public Task updateTaskStatus(String taskId, TaskStatus newStatus, User currentUser) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (newStatus == TaskStatus.DONE && task.getBlockedBy() != null && !task.getBlockedBy().isEmpty()) {
            for (String blockerId : task.getBlockedBy()) {
                Task blocker = taskRepo.findById(blockerId)
                        .orElseThrow(() -> new RuntimeException("Blocking task not found"));
                if (blocker.getStatus() != TaskStatus.DONE) {
                    throw new IllegalStateException("Cannot complete task. Blocked by: " + blocker.getTitle());
                }
            }
        }

        String oldStatus = task.getStatus() != null ? task.getStatus().name() : null;
        task.setStatus(newStatus);
        Task saved = taskRepo.save(task);

        logActivity(taskId, task.getBoardId(), currentUser,
                ActivityAction.STATUS_CHANGED, oldStatus, newStatus.name());

        return saved;
    }

    // REPLACE WITH THIS:
    public void deleteTask(String taskId, User currentUser) {
        Task task = taskRepo.findById(taskId).orElse(null);
        if (task != null) {
            logActivity(taskId, task.getBoardId(), currentUser,
                    ActivityAction.TASK_DELETED, task.getTitle(), null);
        }
        taskRepo.deleteById(taskId);
    }

    private void logActivity(String taskId, String boardId, User user,
            ActivityAction action, String oldValue, String newValue) {
        ActivityLog log = new ActivityLog();
        log.setTaskId(taskId);
        log.setBoardId(boardId);
        log.setUserId(user.getId());
        log.setUsername(user.getUsername());
        log.setAction(action.name());
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        activityLogRepo.save(log);
    }
}