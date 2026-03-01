package com.goodgovit.stc.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSubmissionRequest {
    @NotNull
    private Long quizId;
    @NotNull
    private Long etudiantId;
    // Map of questionId -> list of selected reponseIds
    @NotNull
    private Map<Long, java.util.List<Long>> reponses;
}
