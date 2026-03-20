package com.syncpace.backend.repository;

import com.syncpace.backend.model.Board;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardRepo extends MongoRepository<Board,String> {
    // Fetch all boards belonging to a specific user
    List<Board> findByUserId(String userId);

    // Fetch a board by its ID only if it belongs to the given user
    Optional<Board> findByIdAndUserId(String id, String userId);
}
