package com.goodgovit.stc.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionResultDto {
    private Long questionId;
    private String enonce;
    private boolean correct;
    private List<Long> selectedReponseIds;
    private List<Long> correctReponseIds;
}
