package com.flightbooking;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.flightbooking.config.FlightApiProperties;

@SpringBootApplication
@EnableConfigurationProperties(FlightApiProperties.class)
public class FlightBookingApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SpringApplication.run(FlightBookingApplication.class, args);
    }
}
