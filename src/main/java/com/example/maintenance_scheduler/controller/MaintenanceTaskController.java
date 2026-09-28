package com.example.maintenance_scheduler.controller;

import com.example.maintenance_scheduler.dto.MaintenanceTaskRequest;
import com.example.maintenance_scheduler.entity.MaintenanceTask;
import com.example.maintenance_scheduler.service.MaintenanceTaskService;
import org.springframework.web.bind.annotation.*;
import com.example.maintenance_scheduler.entity.Machine;
import java.util.List;
import jakarta.validation.Valid;
@RestController
@RequestMapping("/api/maintenance-tasks")
public class MaintenanceTaskController {

    private final MaintenanceTaskService maintenanceTaskService;

    public MaintenanceTaskController(
            MaintenanceTaskService maintenanceTaskService) {

        this.maintenanceTaskService = maintenanceTaskService;
    }

    // Create a maintenance task and assign a technician
    @PostMapping
    public MaintenanceTask createTask(
          @Valid @RequestBody MaintenanceTaskRequest request) {

        return maintenanceTaskService.createTask(request);
    }

    // Get all maintenance tasks
    @GetMapping
    public List<MaintenanceTask> getAllTasks() {

        return maintenanceTaskService.getAllTasks();
    }

    // Get maintenance task by ID
    @GetMapping("/{id}")
    public MaintenanceTask getTaskById(
            @PathVariable Long id) {

        return maintenanceTaskService.getTaskById(id);
    }

    // Get tasks for a particular machine
    @GetMapping("/machine/{machineId}")
    public List<MaintenanceTask> getTasksByMachine(
            @PathVariable Long machineId) {

        return maintenanceTaskService
                .getTasksByMachine(machineId);
    }

    // Get all OPEN tasks
    @GetMapping("/open")
    public List<MaintenanceTask> getOpenTasks() {

        return maintenanceTaskService.getOpenTasks();
    }

    // Check all machines for maintenance
    @GetMapping("/check")
    public String checkMaintenance() {

        maintenanceTaskService.checkAllMachines();

        return "Maintenance check completed";
    }

    // Complete a maintenance task
    @PutMapping("/{id}/complete")
    public MaintenanceTask completeTask(
            @PathVariable Long id,
            @RequestParam(required = false) String notes) {

        return maintenanceTaskService.completeTask(id, notes);
    }

    @GetMapping("/overdue")
    public List<Machine> getOverdueMachines() {

        return maintenanceTaskService.getOverdueMachines();
    }
}