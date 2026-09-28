package com.example.maintenance_scheduler.controller;

import com.example.maintenance_scheduler.entity.MaintenanceTask;
import com.example.maintenance_scheduler.service.MaintenanceTaskService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance-tasks")
public class MaintenanceTaskController {

    private final MaintenanceTaskService maintenanceTaskService;

    public MaintenanceTaskController(
            MaintenanceTaskService maintenanceTaskService) {

        this.maintenanceTaskService = maintenanceTaskService;
    }

    @PostMapping
    public MaintenanceTask createTask(
            @RequestBody MaintenanceTask task) {

        return maintenanceTaskService.createTask(task);
    }

    @GetMapping
    public List<MaintenanceTask> getAllTasks() {
        return maintenanceTaskService.getAllTasks();
    }

    @GetMapping("/{id}")
    public MaintenanceTask getTaskById(@PathVariable Long id) {
        return maintenanceTaskService.getTaskById(id);
    }

    @GetMapping("/machine/{machineId}")
    public List<MaintenanceTask> getTasksByMachine(
            @PathVariable Long machineId) {

        return maintenanceTaskService.getTasksByMachine(machineId);
    }

    @GetMapping("/open")
    public List<MaintenanceTask> getOpenTasks() {
        return maintenanceTaskService.getOpenTasks();
    }
}