package com.goodgovit.stc.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "etudiants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Etudiant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String matricule;

    @Column(nullable = false)
    @Builder.Default
    private float progressionGlobale = 0.0f;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false, unique = true)
    private Utilisateur utilisateur;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "etudiant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InscriptionCours> inscriptions = new ArrayList<>();

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne(mappedBy = "etudiant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private RfidQr badge;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToMany(mappedBy = "etudiants")
    @Builder.Default
    private List<Evaluation> evaluations = new ArrayList<>();
}
