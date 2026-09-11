package com.disastermanagement.service;

import com.disastermanagement.exception.AuthenticationException;
import com.disastermanagement.model.User;

public interface AuthenticationService {
    User login(String emailOrPhone, String password) throws AuthenticationException;
    User register(String fullName, String email, String password, String phone, String role) throws AuthenticationException;
    void logout();
    User getCurrentUser();
}
