package com.goodgovit.stc.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresencePayload {
    private String sensorId;
    private int count;
    private boolean detected;
    private String timestamp;
}
