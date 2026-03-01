package com.goodgovit.stc.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceStatusPayload {
    private String deviceId;
    private String status; // "ONLINE" or "OFFLINE"
    private String firmware;
    private String mac;
    private String timestamp;
}
