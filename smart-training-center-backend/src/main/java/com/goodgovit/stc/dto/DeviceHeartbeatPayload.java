package com.goodgovit.stc.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceHeartbeatPayload {
    private String deviceId;
    private long uptime;
    private long freeMemory;
    private String timestamp;
}
