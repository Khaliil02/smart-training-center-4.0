package com.goodgovit.stc.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressionRequest {
    @Min(0)
    @Max(100)
    private float progression;
}
