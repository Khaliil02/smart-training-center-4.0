package com.goodgovit.stc.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Co2Payload {
    private String sensorId;
    private float value;
    private String unit;
    private String timestamp;
}
