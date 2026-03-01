package com.goodgovit.stc.entity;

import com.goodgovit.stc.entity.enums.TypeEvaluation;
import com.goodgovit.stc.entity.enums.StatutEvaluation;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "evaluations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeEvaluation type;

    private LocalDate date;

    @Column(nullable = false)
    @Builder.Default
    private float noteMaximale = 20.0f;

    @Column(nullable = false)
    @Builder.Default
    private float seuilValidation = 80.0f;

    @Builder.Default
    private float coefficient = 1.0f;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutEvaluation statut = StatutEvaluation.BROUILLON;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cours_id", nullable = false)
    private Cours cours;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToMany
    @JoinTable(
        name = "evaluation_etudiants",
        joinColumns = @JoinColumn(name = "evaluation_id"),
        inverseJoinColumns = @JoinColumn(name = "etudiant_id")
    )
    @Builder.Default
    private List<Etudiant> etudiants = new ArrayList<>();
}
