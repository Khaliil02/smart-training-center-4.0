package com.goodgovit.stc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizRequest {
    @NotBlank
    private String titre;
    private String description;
    @NotNull
    private Long coursId;
    private List<QuestionRequest> questions;
}
