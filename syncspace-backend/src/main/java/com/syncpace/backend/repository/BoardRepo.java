package com.syncpace.backend.repository;

import com.syncpace.backend.model.Board;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BoardRepo extends MongoRepository<Board,String> {
}
