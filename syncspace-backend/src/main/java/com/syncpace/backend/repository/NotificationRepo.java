package com.syncpace.backend.repository;

import com.syncpace.backend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepo extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    long countByUserIdAndReadFalse(String userId);
    void deleteByUserId(String userId);
}
