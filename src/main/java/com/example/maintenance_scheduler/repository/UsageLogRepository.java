package com.example.maintenance_scheduler.repository;

import com.example.maintenance_scheduler.entity.UsageLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsageLogRepository extends JpaRepository<UsageLog, Long> {

    List<UsageLog> findByMachineId(Long machineId);
}