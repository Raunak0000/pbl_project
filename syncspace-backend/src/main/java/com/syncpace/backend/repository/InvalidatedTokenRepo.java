package com.syncpace.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.syncpace.backend.model.InvalidatedToken;

public interface InvalidatedTokenRepo extends MongoRepository<InvalidatedToken, String> {
    boolean existsByToken(String token);
}
