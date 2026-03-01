package com.goodgovit.stc.entity;

import com.goodgovit.stc.entity.enums.TypeAlerte;
import com.goodgovit.stc.entity.enums.StatutAlerte;
import com.goodgovit.stc.entity.enums.SourceDonnee;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alertes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alerte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeAlerte type;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private LocalDateTime dateHeure;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutAlerte statut = StatutAlerte.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SourceDonnee source = SourceDonnee.SIMULATOR;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salle_id")
    private Salle salle;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capteur_id")
    private CapteurIoT capteur;

    @PrePersist
    protected void onCreate() {
        if (dateHeure == null) dateHeure = LocalDateTime.now();
    }
}
