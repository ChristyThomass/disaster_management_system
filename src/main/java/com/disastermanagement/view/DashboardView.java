package com.disastermanagement.view;

import com.disastermanagement.model.User;
import com.disastermanagement.model.Admin;
import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;

public class DashboardView {

    private BorderPane view;
    private User currentUser;
    private VBox centerContent; // The dynamic content area

    public DashboardView(User user) {
        this.currentUser = user;
        initializeUI();
    }

    private void initializeUI() {
        view = new BorderPane();
        
        // Navigation Top Bar
        HBox topNav = new HBox(20);
        topNav.setPadding(new Insets(15));
        topNav.setStyle("-fx-background-color: #ffffff; -fx-border-color: #e2e2e2; -fx-border-width: 0 0 1 0;");
        
        Label brand = new Label("Kerala Relief");
        brand.setFont(Font.font("Arial", 20));
        brand.setTextFill(Color.web("#af101a"));
        
        Label userLabel = new Label("Logged in as: " + currentUser.getFullName() + " (" + currentUser.getRoleName() + ")");
        
        Button sosButton = new Button("TRIGGER SOS");
        sosButton.setStyle("-fx-background-color: red; -fx-text-fill: white; -fx-font-weight: bold; -fx-cursor: hand;");

        topNav.getChildren().addAll(brand, userLabel, sosButton);
        view.setTop(topNav);

        // Sidebar Navigation
        VBox sidebar = new VBox(10);
        sidebar.setPadding(new Insets(15));
        sidebar.setStyle("-fx-background-color: #f4f4f4; -fx-border-color: #e2e2e2; -fx-border-width: 0 1 0 0;");
        sidebar.setPrefWidth(200);
        
        Button homeBtn = new Button("Home / Map");
        Button activeAlertsBtn = new Button("Active Alerts");
        Button reportDisasterBtn = new Button("Report Disaster");
        
        // Style buttons
        String btnStyle = "-fx-background-color: transparent; -fx-text-fill: #333; -fx-alignment: CENTER_LEFT; -fx-pref-width: 180;";
        homeBtn.setStyle(btnStyle);
        activeAlertsBtn.setStyle(btnStyle);
        reportDisasterBtn.setStyle(btnStyle);

        sidebar.getChildren().addAll(homeBtn, activeAlertsBtn, reportDisasterBtn);

        // Polymorphism/Role Check for Admin features
        if (currentUser instanceof Admin) {
            Button adminPanelBtn = new Button("Admin Dashboard");
            adminPanelBtn.setStyle(btnStyle + "-fx-text-fill: #af101a; -fx-font-weight: bold;");
            
            adminPanelBtn.setOnAction(e -> {
                AdminDashboardView adminView = new AdminDashboardView((Admin) currentUser);
                view.setCenter(adminView.getView());
            });
            sidebar.getChildren().add(adminPanelBtn);
        }

        view.setLeft(sidebar);
        
        // Default Center Content
        centerContent = new VBox(10);
        centerContent.setPadding(new Insets(20));
        centerContent.getChildren().add(new Label("Welcome to the 100% Java Disaster Management System."));
        view.setCenter(centerContent);
        
        // Navigation Handlers
        homeBtn.setOnAction(e -> view.setCenter(centerContent));
        
        reportDisasterBtn.setOnAction(e -> {
            ReportDisasterView reportView = new ReportDisasterView(currentUser);
            view.setCenter(reportView.getView());
        });
        
        activeAlertsBtn.setOnAction(e -> {
            ActiveAlertsView alertsView = new ActiveAlertsView();
            view.setCenter(alertsView.getView());
        });
    }
    
    public BorderPane getView() {
        return view;
    }
}
