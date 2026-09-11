package com.disastermanagement.view;

import javafx.geometry.Insets;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

public class ActiveAlertsView {
    private VBox view;

    public ActiveAlertsView() {
        initializeUI();
    }

    private void initializeUI() {
        view = new VBox(15);
        view.setPadding(new Insets(30));

        Label title = new Label("Active Emergency Alerts");
        title.setFont(Font.font("Arial", FontWeight.BOLD, 22));

        ListView<String> alertList = new ListView<>();
        // Mock data for demo purposes. In reality, fetch from AlertService
        alertList.getItems().addAll(
            "🔴 CRITICAL - Landslide reported in Meppadi, Wayanad",
            "🟠 HIGH - Heavy Rainfall warning for Idukki district",
            "🟡 MODERATE - Road blocked due to fallen trees in Kochi"
        );
        alertList.setStyle("-fx-font-family: Arial; -fx-font-size: 14px;");

        view.getChildren().addAll(title, alertList);
    }

    public VBox getView() {
        return view;
    }
}
