package com.goodgovit.stc.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "matieres")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Matiere {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nom;

    @Builder.Default
    private float coefficient = 1.0f;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialite_id", nullable = false)
    private Specialite specialite;
}
