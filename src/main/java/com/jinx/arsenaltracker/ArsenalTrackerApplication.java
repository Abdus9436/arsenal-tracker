package com.jinx.arsenaltracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ArsenalTrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ArsenalTrackerApplication.class, args);
	}
}