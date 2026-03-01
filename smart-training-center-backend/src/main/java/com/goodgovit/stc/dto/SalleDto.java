package com.goodgovit.stc.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalleDto {
    private Long id;
    private String nomSalle;
    private int capacite;
    private String type; // TypeSalle enum name
    private List<CapteurIoTDto> capteurs;
}
