package com.syncpace.backend.repository;

import com.syncpace.backend.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepo extends MongoRepository<Task,String> {
    // Fetches all tasks for a specific board so the frontend can render the Kanban view
    List<Task> findByBoardId(String boardId);

    // Allows the backend to quickly filter tasks by team (e.g., 'Engineering')
    List<Task> findByTeam(String team);

    // Deletes all tasks associated with a specific board
    void deleteByBoardId(String boardId);
}
