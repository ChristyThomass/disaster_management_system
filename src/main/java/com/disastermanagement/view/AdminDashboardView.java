package com.disastermanagement.view;

import com.disastermanagement.model.Admin;
import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

public class AdminDashboardView {
    private VBox view;
    private Admin currentAdmin;

    public AdminDashboardView(Admin admin) {
        this.currentAdmin = admin;
        initializeUI();
    }

    private void initializeUI() {
        view = new VBox(15);
        view.setPadding(new Insets(30));

        Label title = new Label("Administrator Dashboard");
        title.setFont(Font.font("Arial", FontWeight.BOLD, 22));
        
        Label welcome = new Label("Welcome to the secure admin portal, " + currentAdmin.getFullName());

        Button genReportBtn = new Button("Generate System Report");
        genReportBtn.setOnAction(e -> {
            // Polymorphism usage
            currentAdmin.generateSystemReport();
            welcome.setText("Report generated in console.");
        });

        view.getChildren().addAll(title, welcome, genReportBtn);
    }

    public VBox getView() {
        return view;
    }
}
