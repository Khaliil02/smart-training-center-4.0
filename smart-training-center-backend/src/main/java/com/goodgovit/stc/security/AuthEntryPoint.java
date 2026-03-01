package com.goodgovit.stc.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.goodgovit.stc.dto.ApiError;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class AuthEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException)
            throws IOException, ServletException {

        log.error("Unauthorized access attempt: {}", authException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpStatus.UNAUTHORIZED.value());

        ApiError error = ApiError.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message("Non autorisé - Authentification requise")
                .details(authException.getMessage())
                .build();

        new ObjectMapper().findAndRegisterModules().writeValue(response.getOutputStream(), error);
    }
}
