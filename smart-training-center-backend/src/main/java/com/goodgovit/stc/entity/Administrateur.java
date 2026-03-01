package com.goodgovit.stc.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "administrateurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Administrateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false, unique = true)
    private Utilisateur utilisateur;
}
