package com.goodgovit.stc.entity;

import com.goodgovit.stc.entity.enums.TypeDashboard;
import com.goodgovit.stc.entity.enums.FrequenceMiseAJour;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tableaux_de_bord")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableauDeBord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeDashboard type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FrequenceMiseAJour frequenceMiseAJour;

    @Column(columnDefinition = "TEXT")
    private String indicateurs;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToMany
    @JoinTable(
        name = "dashboard_utilisateurs",
        joinColumns = @JoinColumn(name = "dashboard_id"),
        inverseJoinColumns = @JoinColumn(name = "utilisateur_id")
    )
    @Builder.Default
    private List<Utilisateur> utilisateurs = new ArrayList<>();
}
