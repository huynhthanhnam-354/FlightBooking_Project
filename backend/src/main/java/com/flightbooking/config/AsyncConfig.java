package com.flightbooking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuration for Asynchronous Task Execution.
 * Optimized for I/O intensive tasks like sending emails.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "emailExecutor")
    public Executor emailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // Tối ưu hóa Thread Pool dựa trên tính chất I/O của tác vụ gửi Email
        executor.setCorePoolSize(5);        // Số lượng luồng luôn duy trì
        executor.setMaxPoolSize(10);       // Số lượng luồng tối đa khi hàng đợi đầy
        executor.setQueueCapacity(100);    // Dung lượng hàng đợi chờ xử lý
        executor.setThreadNamePrefix("EmailTask-"); // Tiền tố tên thread để dễ debug/trace
        
        // Đảm bảo các thread đã hoàn thành công việc trước khi tắt ứng dụng
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        
        executor.initialize();
        return executor;
    }
}
