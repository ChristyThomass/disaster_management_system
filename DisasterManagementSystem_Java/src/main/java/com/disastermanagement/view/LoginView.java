package com.disastermanagement.view;

import com.disastermanagement.Main;
import com.disastermanagement.exception.AuthenticationException;
import com.disastermanagement.model.User;
import com.disastermanagement.service.AuthenticationService;
import com.disastermanagement.service.AuthenticationServiceImpl;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

public class LoginView {

    private VBox view;
    private AuthenticationService authService;

    public LoginView() {
        authService = new AuthenticationServiceImpl();
        initializeUI();
    }

    private void initializeUI() {
        view = new VBox(15);
        view.setAlignment(Pos.CENTER);
        view.setPadding(new Insets(40));
        view.setStyle("-fx-background-color: #f9f9f9;");

        Label titleLabel = new Label("Disaster Management System");
        titleLabel.setFont(Font.font("Arial", FontWeight.BOLD, 24));
        titleLabel.setTextFill(Color.web("#af101a"));

        Label subTitle = new Label("Sign In to Access Dashboard");
        
        TextField emailField = new TextField();
        emailField.setPromptText("Email or Phone");
        emailField.setMaxWidth(300);

        PasswordField passwordField = new PasswordField();
        passwordField.setPromptText("Password");
        passwordField.setMaxWidth(300);

        Label errorLabel = new Label();
        errorLabel.setTextFill(Color.RED);

        Button loginBtn = new Button("Sign In");
        loginBtn.setStyle("-fx-background-color: #af101a; -fx-text-fill: white; -fx-font-weight: bold;");
        loginBtn.setMinWidth(300);

        loginBtn.setOnAction(e -> {
            try {
                User user = authService.login(emailField.getText(), passwordField.getText());
                DashboardView dashboard = new DashboardView(user);
                Main.navigateTo(new Scene(dashboard.getView(), 1000, 700));
            } catch (AuthenticationException ex) {
                errorLabel.setText(ex.getMessage());
            }
        });

        view.getChildren().addAll(titleLabel, subTitle, emailField, passwordField, loginBtn, errorLabel);
    }

    public VBox getView() {
        return view;
    }
}
