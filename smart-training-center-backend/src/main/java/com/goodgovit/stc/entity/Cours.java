package com.goodgovit.stc.entity;

import com.goodgovit.stc.entity.enums.StatutCours;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cours")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String contenu;

    private String filiere;

    private String niveau;

    private int dureeEstimee;

    @Column(nullable = false)
    @Builder.Default
    private boolean estActif = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutCours statut = StatutCours.BROUILLON;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enseignant_id")
    private Enseignant enseignant;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salle_id")
    private Salle salle;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "cours", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InscriptionCours> inscriptions = new ArrayList<>();

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "cours", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Evaluation> evaluations = new ArrayList<>();

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToMany
    @JoinTable(
        name = "cours_capteurs",
        joinColumns = @JoinColumn(name = "cours_id"),
        inverseJoinColumns = @JoinColumn(name = "capteur_id")
    )
    @Builder.Default
    private List<CapteurIoT> capteurs = new ArrayList<>();
}
