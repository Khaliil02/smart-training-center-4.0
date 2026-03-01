package com.goodgovit.stc.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionRequest {
    @NotBlank
    private String enonce;
    @NotBlank
    private String type;
    private List<ReponseRequest> reponses;
}
