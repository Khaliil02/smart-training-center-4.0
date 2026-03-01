package com.goodgovit.stc.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IoTDeviceDto {
    private Long id;
    private String type;
    private String adresseMac;
    private String firmwareVersion;
    private boolean estEnLigne;
    private float valeurMesuree;
    private LocalDateTime dateHeureMesure;
    private Long salleId;
    private String salleNom;
    private DeviceHeartbeatDto lastHeartbeat;
}
