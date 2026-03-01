package com.goodgovit.stc.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDto {
    private Long id;
    private String enonce;
    private String type;
    private List<ReponseDto> reponses;
}
