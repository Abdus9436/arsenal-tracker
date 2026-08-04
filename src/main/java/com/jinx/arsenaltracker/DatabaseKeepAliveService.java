package com.jinx.arsenaltracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;

@Service
public class DatabaseKeepAliveService {

    @Autowired
    private DataSource dataSource;

    @Scheduled(fixedDelay = 1800000)
    public void keepAlive() {
        try (Connection conn = dataSource.getConnection()) {
            conn.isValid(1);
        } catch (Exception e) {
            System.err.println("Keep-alive ping failed: " + e.getMessage());
        }
    }
}