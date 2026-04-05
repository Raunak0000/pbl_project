package com.syncpace.backend.repository;

import com.syncpace.backend.model.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityLogRepo extends MongoRepository<ActivityLog, String> {

    // Fetch all logs for a specific task, newest first — used in TaskController
    Page<ActivityLog> findByTaskIdOrderByTimestampDesc(String taskId, Pageable pageable);

    // Fetch all logs for an entire board, newest first — used in AdminController
    Page<ActivityLog> findByBoardIdOrderByTimestampDesc(String boardId, Pageable pageable);
}