package com.goodgovit.stc.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironnementDto {
    private Long salleId;
    private String salleNom;
    private Float temperature;
    private LocalDateTime temperatureTimestamp;
    private Float co2;
    private LocalDateTime co2Timestamp;
    private Integer presenceCount;
    private LocalDateTime presenceTimestamp;
}
