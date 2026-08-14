package com.jinx.arsenaltracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AppConfigService {

    @Autowired
    private AppConfigRepository appConfigRepository;

    public String get(String key, String defaultValue) {
        return appConfigRepository.findById(key)
                .map(AppConfig::getConfigValue)
                .orElse(defaultValue);
    }

    public void set(String key, String value) {
        AppConfig config = appConfigRepository.findById(key)
                .orElse(new AppConfig(key, value, ""));
        config.setConfigValue(value);
        appConfigRepository.save(config);
    }

    public int getInt(String key, int defaultValue) {
        try {
            return Integer.parseInt(get(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public void initDefaults() {
        if (appConfigRepository.count() == 0) {
            appConfigRepository.save(new AppConfig("current_season", "2025", "Current football season year"));
            appConfigRepository.save(new AppConfig("exact_score_points", "3", "Points awarded for exact score prediction"));
            appConfigRepository.save(new AppConfig("correct_outcome_points", "1", "Points awarded for correct outcome prediction"));
            appConfigRepository.save(new AppConfig("app_announcement", "", "Banner message shown to all users (empty = no banner)"));
            appConfigRepository.save(new AppConfig("fixture_api_url", "https://api.football-data.org/v4/teams/57/matches?season=", "Base URL for fixture sync API"));
            appConfigRepository.save(new AppConfig("max_users", "50", "Maximum number of registered users allowed"));
            appConfigRepository.save(new AppConfig("stats_cache", "", "Cached stats JSON from football API - updated daily at 2am"));
        }
    }
}