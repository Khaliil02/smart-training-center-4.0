package com.goodgovit.stc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String type;
    private Long userId;
    private String email;
    private String nom;
    private String prenom;
    private Set<String> roles;
}
