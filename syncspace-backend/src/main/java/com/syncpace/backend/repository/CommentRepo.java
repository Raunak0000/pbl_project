package com.syncpace.backend.repository;

import com.syncpace.backend.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepo extends MongoRepository<Comment, String> {

    List<Comment> findByTaskIdOrderByCreatedAtAsc(String taskId);

    void deleteByTaskId(String taskId);
}
