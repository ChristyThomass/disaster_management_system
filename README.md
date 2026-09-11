# Disaster Management System (Java OOP Implementation)

## 1. Project Objective
This project is a 100% Java-based Desktop Application rebuild of the original web-based Disaster Management System. It uses Java 17, JavaFX for the GUI, and Maven for dependency management.

## 2. Where OOP Concepts Are Used
This project strictly adheres to Object-Oriented Programming principles:

* **Abstraction**: The `User` class is abstract, forcing subclasses to define their `getRoleName()`. `AuthenticationService` is an interface separating contract from implementation.
* **Encapsulation**: All fields in models (like `Citizen`, `Admin`, `SOSAlert`) are `private` and accessed only via `public` getter/setter methods.
* **Inheritance**: `Citizen` and `Admin` extend the base `User` class, inheriting common fields like name and email while providing specific behaviors.
* **Polymorphism**: The `UserRepository.authenticate()` method returns a generic `User` object, which is dynamically instantiated as either an `Admin` or `Citizen` based on database role lookups.
* **Exception Handling**: Custom exceptions like `AuthenticationException` and `DatabaseException` handle specific failure states gracefully in the `LoginView`.

## 3. Database
* PostgreSQL database connected via JDBC (`DatabaseConnection.java`).
* **IMPORTANT:** Do NOT hardcode your Supabase database password. Pass it via the `SUPABASE_DB_PASSWORD` environment variable when running the application.

## 4. How to Run
```bash
mvn clean install
mvn javafx:run
```
