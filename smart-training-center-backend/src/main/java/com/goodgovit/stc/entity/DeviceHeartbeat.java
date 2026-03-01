package com.goodgovit.stc.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "device_heartbeats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceHeartbeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String deviceId;

    private long uptime;

    private long freeMemory;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capteur_id")
    private CapteurIoT capteur;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) timestamp = LocalDateTime.now();
    }
}
