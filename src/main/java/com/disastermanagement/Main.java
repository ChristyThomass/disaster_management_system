package com.disastermanagement;

import com.disastermanagement.view.LoginView;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class Main extends Application {
    
    private static Stage primaryStage;

    @Override
    public void start(Stage stage) {
        primaryStage = stage;
        primaryStage.setTitle("Kerala Disaster Management System - OOP JavaFX");
        
        // Start with the Login View
        LoginView loginView = new LoginView();
        Scene scene = new Scene(loginView.getView(), 800, 600);
        
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void navigateTo(Scene newScene) {
        primaryStage.setScene(newScene);
    }

    public static void main(String[] args) {
        launch(args);
    }
}
