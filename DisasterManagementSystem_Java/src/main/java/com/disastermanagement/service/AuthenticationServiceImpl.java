package com.disastermanagement.service;

import com.disastermanagement.exception.AuthenticationException;
import com.disastermanagement.model.User;
import com.disastermanagement.repository.UserRepository;

public class AuthenticationServiceImpl implements AuthenticationService {
    
    private UserRepository userRepository;
    private User currentUser;

    public AuthenticationServiceImpl() {
        this.userRepository = new UserRepository();
    }

    @Override
    public User login(String emailOrPhone, String password) throws AuthenticationException {
        if(emailOrPhone == null || emailOrPhone.trim().isEmpty() || password == null) {
            throw new AuthenticationException("Credentials cannot be empty.");
        }
        
        User user = userRepository.authenticate(emailOrPhone, password);
        if (user == null) {
            throw new AuthenticationException("Invalid username or password.");
        }
        
        this.currentUser = user;
        return user;
    }

    @Override
    public User register(String fullName, String email, String password, String phone, String role) throws AuthenticationException {
        throw new UnsupportedOperationException("Registration not implemented in this demo.");
    }

    @Override
    public void logout() {
        this.currentUser = null;
    }

    @Override
    public User getCurrentUser() {
        return currentUser;
    }
}
