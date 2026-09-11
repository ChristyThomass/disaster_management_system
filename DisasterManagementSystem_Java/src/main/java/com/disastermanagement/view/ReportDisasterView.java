package com.disastermanagement.view;

import com.disastermanagement.model.DisasterReport;
import com.disastermanagement.model.User;
import com.disastermanagement.service.DisasterService;
import com.disastermanagement.service.DisasterServiceImpl;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

public class ReportDisasterView {

    private VBox view;
    private User currentUser;
    private DisasterService disasterService;

    public ReportDisasterView(User currentUser) {
        this.currentUser = currentUser;
        this.disasterService = new DisasterServiceImpl();
        initializeUI();
    }

    private void initializeUI() {
        view = new VBox(15);
        view.setPadding(new Insets(30));
        view.setStyle("-fx-background-color: white; -fx-background-radius: 8; -fx-border-color: #e2e2e2; -fx-border-radius: 8;");

        Label title = new Label("Report a Disaster");
        title.setFont(Font.font("Arial", FontWeight.BOLD, 22));

        ComboBox<String> typeCombo = new ComboBox<>();
        typeCombo.getItems().addAll("Flood", "Landslide", "Fire", "Earthquake", "Other");
        typeCombo.setPromptText("Select Disaster Type");
        typeCombo.setPrefWidth(300);

        TextField locationField = new TextField();
        locationField.setPromptText("Location / Address");
        locationField.setPrefWidth(300);

        ComboBox<String> severityCombo = new ComboBox<>();
        severityCombo.getItems().addAll("Low", "Moderate", "High", "Critical");
        severityCombo.setPromptText("Select Severity");
        severityCombo.setPrefWidth(300);

        TextArea descArea = new TextArea();
        descArea.setPromptText("Describe the situation...");
        descArea.setPrefRowCount(4);
        descArea.setPrefWidth(300);

        Label statusLabel = new Label();

        Button submitBtn = new Button("Submit Report");
        submitBtn.setStyle("-fx-background-color: #10b981; -fx-text-fill: white; -fx-font-weight: bold;");
        
        submitBtn.setOnAction(e -> {
            try {
                DisasterReport report = new DisasterReport(
                    typeCombo.getValue(),
                    locationField.getText(),
                    descArea.getText(),
                    severityCombo.getValue(),
                    currentUser.getId()
                );
                
                boolean success = disasterService.submitReport(report);
                if (success) {
                    statusLabel.setTextFill(Color.GREEN);
                    statusLabel.setText("Report submitted successfully!");
                    // clear fields
                    locationField.clear(); descArea.clear(); typeCombo.getSelectionModel().clearSelection();
                } else {
                    statusLabel.setTextFill(Color.RED);
                    statusLabel.setText("Database error. Could not save report.");
                }
            } catch (Exception ex) {
                statusLabel.setTextFill(Color.RED);
                statusLabel.setText("Please fill out all required fields.");
            }
        });

        view.getChildren().addAll(title, new Label("Type:"), typeCombo, new Label("Location:"), locationField, new Label("Severity:"), severityCombo, new Label("Description:"), descArea, submitBtn, statusLabel);
    }

    public VBox getView() {
        return view;
    }
}
