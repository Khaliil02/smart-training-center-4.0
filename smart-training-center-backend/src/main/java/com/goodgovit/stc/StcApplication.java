package com.goodgovit.stc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StcApplication {

    public static void main(String[] args) {
        SpringApplication.run(StcApplication.class, args);
    }
}
