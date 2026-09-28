package com.example.maintenance_scheduler.service;

import com.example.maintenance_scheduler.entity.MaintenanceTask;
import com.example.maintenance_scheduler.entity.TaskStatus;
import com.example.maintenance_scheduler.repository.MaintenanceTaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceTaskService {

    private final MaintenanceTaskRepository maintenanceTaskRepository;

    public MaintenanceTaskService(MaintenanceTaskRepository maintenanceTaskRepository) {
        this.maintenanceTaskRepository = maintenanceTaskRepository;
    }

    public MaintenanceTask createTask(MaintenanceTask task) {

        boolean alreadyOpen = maintenanceTaskRepository
                .existsByMachineIdAndStatus(
                        task.getMachine().getId(),
                        TaskStatus.OPEN
                );

        if (alreadyOpen) {
            throw new RuntimeException(
                    "An open maintenance task already exists for this machine"
            );
        }

        task.setStatus(TaskStatus.OPEN);

        return maintenanceTaskRepository.save(task);
    }

    public List<MaintenanceTask> getAllTasks() {
        return maintenanceTaskRepository.findAll();
    }

    public MaintenanceTask getTaskById(Long id) {
        return maintenanceTaskRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Maintenance task not found"));
    }

    public List<MaintenanceTask> getTasksByMachine(Long machineId) {
        return maintenanceTaskRepository.findByMachineId(machineId);
    }

    public List<MaintenanceTask> getOpenTasks() {
        return maintenanceTaskRepository.findByStatus(TaskStatus.OPEN);
    }
}