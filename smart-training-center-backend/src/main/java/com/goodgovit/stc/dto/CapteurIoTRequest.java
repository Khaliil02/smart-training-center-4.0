package com.goodgovit.stc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CapteurIoTRequest {
    @NotBlank
    private String type; // TypeCapteur enum name
    @NotBlank
    private String adresseMac;
    private String firmwareVersion;
    @NotNull
    private Long salleId;
}
