package com.goodgovit.stc.entity;

import com.goodgovit.stc.entity.enums.EtatInscription;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "inscriptions_cours", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"etudiant_id", "cours_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InscriptionCours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate dateInscription;

    @Column(nullable = false)
    @Builder.Default
    private float progression = 0.0f;

    @Builder.Default
    private float noteFinale = 0.0f;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EtatInscription etat = EtatInscription.EN_COURS;

    private LocalDateTime dateDernierAcces;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cours_id", nullable = false)
    private Cours cours;

    @PrePersist
    protected void onCreate() {
        if (dateInscription == null) dateInscription = LocalDate.now();
    }
}
