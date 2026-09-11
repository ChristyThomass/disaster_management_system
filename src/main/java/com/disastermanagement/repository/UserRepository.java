package com.disastermanagement.repository;

import com.disastermanagement.database.DatabaseConnection;
import com.disastermanagement.model.Admin;
import com.disastermanagement.model.Citizen;
import com.disastermanagement.model.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UserRepository {

    public User authenticate(String emailOrPhone, String password) {
        String query = "SELECT id, full_name, email, phone, role, district FROM users " +
                       "WHERE (email = ? OR phone = ?) AND (password = ? OR password_hash = ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
             
            stmt.setString(1, emailOrPhone);
            stmt.setString(2, emailOrPhone);
            stmt.setString(3, password);
            stmt.setString(4, password);

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                String id = rs.getString("id");
                String fullName = rs.getString("full_name");
                String email = rs.getString("email");
                String phone = rs.getString("phone");
                String role = rs.getString("role");
                String district = rs.getString("district");

                // Polymorphism applied
                if ("Administrator".equalsIgnoreCase(role)) {
                    return new Admin(id, fullName, email, phone, district);
                } else {
                    return new Citizen(id, fullName, email, phone, district);
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error during authentication: " + e.getMessage());
        }
        return null;
    }
}
