package com.goodgovit.stc.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizDto {
    private Long id;
    private String titre;
    private String description;
    private Long coursId;
    private String coursTitre;
    private List<QuestionDto> questions;
}
