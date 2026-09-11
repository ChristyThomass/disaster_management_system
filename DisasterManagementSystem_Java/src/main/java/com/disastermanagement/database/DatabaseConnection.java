package com.disastermanagement.database;

import com.disastermanagement.exception.DatabaseException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    private static final String URL = "jdbc:postgresql://db.auazpiwbvsbzrccsqnyf.supabase.co:5432/postgres";
    private static final String USER = "postgres";
    private static final String PASSWORD = System.getenv("SUPABASE_DB_PASSWORD"); 

    private static Connection connection = null;

    private DatabaseConnection() {}

    public static Connection getConnection() {
        try {
            if (connection == null || connection.isClosed()) {
                String pass = (PASSWORD != null) ? PASSWORD : "YOUR_ACTUAL_PASSWORD_HERE"; 
                connection = DriverManager.getConnection(URL, USER, pass);
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to connect to the database.", e);
        }
        return connection;
    }
}
