---
description: Connect React Dashboard to MongoDB via Spring Boot
---
# Workflow: Connect React Dashboard to MongoDB via Spring Boot

This workflow outlines the essential steps to correctly connect your React frontend to a local MongoDB database using your existing Spring Boot backend. You should use this as a reference or a checklist.

## Prerequisites
1. Ensure your local MongoDB instance is running on `mongodb://localhost:27017/`.
2. Ensure you have the Spring Boot backend project open.

## Step 1: Verify Spring Boot Dependencies
Already checked! Your `syncspace-backend/pom.xml` contains the required dependencies:
- `spring-boot-starter-data-mongodb`
- `spring-boot-starter-webmvc`

## Step 2: Verify MongoDB Configuration
Your `application.properties` is configured correctly:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/syncspace
spring.data.mongodb.database=syncspace
```

## Step 3: Update Domain Entities
Add MongoDB annotations to your domain classes (like `Board` and `Task`). In `syncspace-backend/src/main/java/com/syncpace/backend/model/`:
- Annotate the class with `@Document(collection = "boards")` (or `"tasks"`).
- Annotate the primary key field with `@Id`.

Example:
```java
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "boards")
public class Board {
    @Id
    private String id;
    private String title;
    // Getters and setters...
}
```

## Step 4: Create/Update Spring Data Repositories
Ensure your repository interfaces extend `MongoRepository`. In `syncspace-backend/src/main/java/com/syncpace/backend/repository/`:

```java
import org.springframework.data.mongodb.repository.MongoRepository;
import com.syncpace.backend.model.Task;

public interface TaskRepo extends MongoRepository<Task, String> {
    // Custom query methods if needed
}
```

## Step 5: Start the Backend Server
Run your Spring Boot application (using Maven or your IDE) to ensure there are no startup errors and it successfully connects to the local MongoDB instance. You will see logs indicating connection success.

## Step 6: Verify React API Configuration
In your React code, ensure the `api.ts` file connects to your backend correctly. Since your base URL is already `http://localhost:8080/api`, and CORS is typically handled by Spring Boot, you're on the right track here!

## Step 7: Handle CORS in Spring Boot (If needed)
If you get CORS errors in React, add a CORS configuration to your Spring Boot controllers. You can annotate your controllers (like `BoardController`) with:
```java
@CrossOrigin(origins = "http://localhost:5173") // Assuming React runs on port 5173
@RestController
@RequestMapping("/api/board")
public class BoardController {
    // ...
}
```

## Step 8: Test Frontend-to-Backend-to-DB Integration
Open your React application in the browser and try creating a new Board or Task. Use the browser's Network tab or your terminal console to ensure the Axios requests return `200/201 Success` statuses and that documents are inserted into your MongoDB collection.
