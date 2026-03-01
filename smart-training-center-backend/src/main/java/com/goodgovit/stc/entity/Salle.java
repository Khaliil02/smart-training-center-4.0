package com.goodgovit.stc.entity;

import com.goodgovit.stc.entity.enums.TypeSalle;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "salles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Salle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nomSalle;

    @Column(nullable = false)
    private int capacite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeSalle type;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "salle", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CapteurIoT> capteurs = new ArrayList<>();

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "salle")
    @Builder.Default
    private List<Cours> cours = new ArrayList<>();
}
