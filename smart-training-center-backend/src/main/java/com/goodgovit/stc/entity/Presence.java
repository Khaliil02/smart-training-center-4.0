package com.goodgovit.stc.entity;

import com.goodgovit.stc.entity.enums.MethodePresence;
import com.goodgovit.stc.entity.enums.SourceDonnee;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "presences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Presence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime dateHeure;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MethodePresence methode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SourceDonnee source = SourceDonnee.SIMULATOR;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salle_id", nullable = false)
    private Salle salle;

    @PrePersist
    protected void onCreate() {
        if (dateHeure == null) dateHeure = LocalDateTime.now();
    }
}
