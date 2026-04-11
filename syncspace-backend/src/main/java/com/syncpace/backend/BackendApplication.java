package com.syncpace.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		System.out.println("=== NEW BUILD CHECK ===");

		System.out.println(">>> MONGO ENV = " + System.getenv("SPRING_DATA_MONGODB_URI"));
		SpringApplication.run(BackendApplication.class, args);

	}

}
