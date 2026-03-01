package com.goodgovit.stc.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "responsables_academiques")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponsableAcademique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String departement;

    private String domaine;

    private LocalDate dateAffectation;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false, unique = true)
    private Utilisateur utilisateur;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "responsableAcademique")
    @Builder.Default
    private List<Enseignant> enseignants = new ArrayList<>();
}
