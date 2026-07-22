package com.jinx.arsenaltracker;

import jakarta.persistence.*;

@Entity
public class AppConfig {

    @Id
    private String configKey;

    @Column(columnDefinition = "TEXT")
    private String configValue;

    private String description;

    public AppConfig() {}

    public AppConfig(String configKey, String configValue, String description) {
        this.configKey = configKey;
        this.configValue = configValue;
        this.description = description;
    }

    public String getConfigKey() { return configKey; }
    public void setConfigKey(String configKey) { this.configKey = configKey; }
    public String getConfigValue() { return configValue; }
    public void setConfigValue(String configValue) { this.configValue = configValue; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}