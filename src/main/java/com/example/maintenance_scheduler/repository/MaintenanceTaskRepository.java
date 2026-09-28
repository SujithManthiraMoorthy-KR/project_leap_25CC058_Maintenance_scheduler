package com.example.maintenance_scheduler.repository;

import com.example.maintenance_scheduler.entity.MaintenanceTask;
import com.example.maintenance_scheduler.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, Long> {

    boolean existsByMachineIdAndStatus(Long machineId, TaskStatus status);

    List<MaintenanceTask> findByMachineId(Long machineId);

    List<MaintenanceTask> findByStatus(TaskStatus status);
}