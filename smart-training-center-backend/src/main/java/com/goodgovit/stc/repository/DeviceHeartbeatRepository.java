package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.DeviceHeartbeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceHeartbeatRepository extends JpaRepository<DeviceHeartbeat, Long> {
    List<DeviceHeartbeat> findByDeviceId(String deviceId);
    Optional<DeviceHeartbeat> findTopByDeviceIdOrderByTimestampDesc(String deviceId);
    List<DeviceHeartbeat> findByTimestampAfter(LocalDateTime since);
}
