package com.goodgovit.stc.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResultDto {
    private Long quizId;
    private String quizTitre;
    private Long etudiantId;
    private int totalQuestions;
    private int correctAnswers;
    private float score;
    private float percentage;
    private boolean passed;
    private float seuilValidation;
    private List<QuestionResultDto> details;
}
