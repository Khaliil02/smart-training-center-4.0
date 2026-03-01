package com.goodgovit.stc.entity;

import com.goodgovit.stc.entity.enums.TypeCapteur;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "capteurs_iot")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CapteurIoT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeCapteur type;

    private float valeurMesuree;

    private LocalDateTime dateHeureMesure;

    @Column(nullable = false)
    @Builder.Default
    private boolean estEnLigne = true;

    private String firmwareVersion;

    @Column(unique = true)
    private String adresseMac;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salle_id", nullable = false)
    private Salle salle;
}
