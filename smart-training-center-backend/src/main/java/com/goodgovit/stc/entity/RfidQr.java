package com.goodgovit.stc.entity;

import com.goodgovit.stc.entity.enums.StatutBadge;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rfid_qr")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RfidQr {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "code_qr", nullable = false, unique = true)
    private String codeQR;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutBadge statut = StatutBadge.ACTIF;

    private LocalDateTime dateDerniereLecture;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "etudiant_id", nullable = false, unique = true)
    private Etudiant etudiant;
}
