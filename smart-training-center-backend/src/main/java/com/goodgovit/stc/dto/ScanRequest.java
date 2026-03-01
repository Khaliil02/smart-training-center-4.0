package com.goodgovit.stc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanRequest {
    @NotBlank
    private String badgeCode;
    @NotNull
    private Long salleId;
    @NotBlank
    private String methode; // "RFID" or "QR"
    private String source; // "SIMULATOR" or "HARDWARE", defaults to HARDWARE
}
