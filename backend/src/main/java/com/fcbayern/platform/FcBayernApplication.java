package com.fcbayern.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FcBayernApplication {
    public static void main(String[] args) {
        SpringApplication.run(FcBayernApplication.class, args);
    }
}
