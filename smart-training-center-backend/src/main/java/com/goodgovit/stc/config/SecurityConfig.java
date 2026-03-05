package com.goodgovit.stc.config;

import com.goodgovit.stc.security.AuthEntryPoint;
import com.goodgovit.stc.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthEntryPoint authEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // User self-service endpoints (must be before /api/utilisateurs/**)
                        .requestMatchers("/api/utilisateurs/me", "/api/utilisateurs/me/**").authenticated()

                        // Admin-only endpoints
                        .requestMatchers("/api/utilisateurs/**").hasRole("ADMINISTRATEUR")
                        .requestMatchers("/api/audit/**").hasAnyRole("ADMINISTRATEUR", "RESPONSABLE_ACADEMIQUE")
                        .requestMatchers("/api/iot/devices/**").hasRole("ADMINISTRATEUR")
                        .requestMatchers("/api/alertes/**").hasRole("ADMINISTRATEUR")

                        // Dashboard access by role
                        .requestMatchers("/api/dashboard/administratif").hasRole("ADMINISTRATEUR")
                        .requestMatchers("/api/dashboard/pedagogique")
                        .hasAnyRole("ETUDIANT", "ENSEIGNANT", "ADMINISTRATEUR")
                        .requestMatchers("/api/dashboard/decisionnel")
                        .hasAnyRole("RESPONSABLE_ACADEMIQUE", "ADMINISTRATEUR")
                        .requestMatchers("/api/dashboard/iot/**").hasRole("ADMINISTRATEUR")

                        // All other endpoints require authentication
                        .anyRequest().authenticated());

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
