package com.syncpace.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "app_counters    ")
public class AppCounter {
    @Id
    private String id;
    private long userCount;

    public AppCounter(String id) {
        this.id = id;
    }

    public long getUserCount() {
        return userCount;
    }

    public void setUserCount(long userCount) {
        this.userCount = userCount;
    }
}
