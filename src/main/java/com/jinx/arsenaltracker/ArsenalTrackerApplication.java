package com.jinx.arsenaltracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ArsenalTrackerApplication implements CommandLineRunner {

	@Autowired
	private AppConfigService appConfigService;

	public static void main(String[] args) {
		SpringApplication.run(ArsenalTrackerApplication.class, args);
	}

	@Override
	public void run(String... args) {
		appConfigService.initDefaults();
	}
}