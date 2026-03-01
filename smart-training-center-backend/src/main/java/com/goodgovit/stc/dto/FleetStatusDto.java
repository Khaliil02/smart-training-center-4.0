package com.goodgovit.stc.dto;

import lombok.*;
import java.util.Map;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FleetStatusDto {
    private long totalDevices;
    private long devicesOnline;
    private long devicesOffline;
    private Map<String, Long> firmwareDistribution; // firmware version -> count
    private Map<String, Long> deviceParType; // sensor type -> count
    private List<IoTDeviceDto> devices;
}
