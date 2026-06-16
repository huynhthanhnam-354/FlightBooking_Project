package com.flightbooking;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.flightbooking.config.FlightApiProperties;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(FlightApiProperties.class)
public class FlightBookingApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        
        // ARCHITECT FIX: Force the application to run as a Web (Servlet) environment
        // This ensures Tomcat starts and keeps the process alive on Port 8081.
        SpringApplication app = new SpringApplication(FlightBookingApplication.class);
        app.setWebApplicationType(WebApplicationType.SERVLET);
        app.run(args);
    }
}
