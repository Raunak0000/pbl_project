FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY syncspace-backend/pom.xml .
COPY syncspace-backend/mvnw .
COPY syncspace-backend/.mvn .mvn
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B
COPY syncspace-backend/src src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT sh -c 'java -Dspring.data.mongodb.uri=$SPRING_DATA_MONGODB_URI -jar app.jar'