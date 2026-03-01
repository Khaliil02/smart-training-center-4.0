package com.goodgovit.stc.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceHeartbeatDto {
    private Long id;
    private String deviceId;
    private long uptime;
    private long freeMemory;
    private LocalDateTime timestamp;
}
