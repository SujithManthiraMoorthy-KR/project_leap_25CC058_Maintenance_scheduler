package com.example.maintenance_scheduler.service;

import com.example.maintenance_scheduler.dto.MaintenanceTaskRequest;
import com.example.maintenance_scheduler.entity.Machine;
import com.example.maintenance_scheduler.entity.MaintenanceTask;
import com.example.maintenance_scheduler.entity.MaintenanceType;
import com.example.maintenance_scheduler.entity.TaskStatus;
import com.example.maintenance_scheduler.entity.Technician;
import com.example.maintenance_scheduler.exception.ResourceNotFoundException;
import com.example.maintenance_scheduler.repository.MachineRepository;
import com.example.maintenance_scheduler.repository.MaintenanceTaskRepository;
import com.example.maintenance_scheduler.repository.TechnicianRepository;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaintenanceTaskService {

    private final MaintenanceTaskRepository maintenanceTaskRepository;
    private final MachineRepository machineRepository;
    private final TechnicianRepository technicianRepository;

    public MaintenanceTaskService(
            MaintenanceTaskRepository maintenanceTaskRepository,
            MachineRepository machineRepository,
            TechnicianRepository technicianRepository) {

        this.maintenanceTaskRepository = maintenanceTaskRepository;
        this.machineRepository = machineRepository;
        this.technicianRepository = technicianRepository;
    }

    // Create a maintenance task manually
    public MaintenanceTask createTask(
            MaintenanceTaskRequest request) {

        // Find machine
        Machine machine = machineRepository.findById(
                request.getMachineId()
        ).orElseThrow(() ->
                new ResourceNotFoundException(
                        "Machine not found"
                )
        );

        // Check whether an OPEN task already exists
        boolean alreadyOpen =
                maintenanceTaskRepository.existsByMachineIdAndStatus(
                        machine.getId(),
                        TaskStatus.OPEN
                );

        if (alreadyOpen) {
            throw new RuntimeException(
                    "An open maintenance task already exists for this machine"
            );
        }

        // Find technician
        Technician technician = null;

        if (request.getTechnicianId() != null) {

            technician = technicianRepository.findById(
                    request.getTechnicianId()
            ).orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Technician not found"
                    )
            );
        }

        // Create task
        MaintenanceTask task = new MaintenanceTask();

        task.setMachine(machine);
        task.setTechnician(technician);
        task.setStatus(TaskStatus.OPEN);
        task.setNotes(request.getNotes());

        // Set due information
        if (machine.getMaintenanceType() == MaintenanceType.HOURS) {

            task.setDueUsageHours(
                    machine.getIntervalValue().doubleValue()
            );

        } else {

            task.setDueDate(
                    machine.getLastMaintenanceDate()
                            .plusDays(machine.getIntervalValue())
            );
        }

        return maintenanceTaskRepository.save(task);
    }

    // Automatically check whether maintenance is needed
    public MaintenanceTask checkAndCreateMaintenanceTask(
            Machine machine) {

        // Do not create another OPEN task
        boolean alreadyOpen =
                maintenanceTaskRepository.existsByMachineIdAndStatus(
                        machine.getId(),
                        TaskStatus.OPEN
                );

        if (alreadyOpen) {
            return null;
        }

        boolean maintenanceNeeded = false;

        // HOURS based maintenance
        if (machine.getMaintenanceType() == MaintenanceType.HOURS) {

            double threshold =
                    machine.getIntervalValue() * 0.90;

            Double currentUsage =
                    machine.getCurrentUsageHours();

            if (currentUsage != null &&
                    currentUsage >= threshold) {

                maintenanceNeeded = true;
            }
        }

        // DAYS based maintenance
        else if (machine.getMaintenanceType() == MaintenanceType.DAYS) {

            LocalDate lastMaintenanceDate =
                    machine.getLastMaintenanceDate();

            if (lastMaintenanceDate == null) {
                return null;
            }

            long totalDays =
                    machine.getIntervalValue();

            long thresholdDays =
                    (long) Math.ceil(totalDays * 0.90);

            LocalDate nearDate =
                    lastMaintenanceDate
                            .plusDays(thresholdDays);

            LocalDate today = LocalDate.now();

            if (!today.isBefore(nearDate)) {
                maintenanceNeeded = true;
            }
        }

        if (!maintenanceNeeded) {
            return null;
        }

        // Automatically generated task
        MaintenanceTask task =
                new MaintenanceTask();

        task.setMachine(machine);
        task.setStatus(TaskStatus.OPEN);

        if (machine.getMaintenanceType() == MaintenanceType.HOURS) {

            task.setDueUsageHours(
                    machine.getIntervalValue().doubleValue()
            );

        } else {

            task.setDueDate(
                    machine.getLastMaintenanceDate()
                            .plusDays(
                                    machine.getIntervalValue()
                            )
            );
        }

        return maintenanceTaskRepository.save(task);
    }

    // Check all machines
    public void checkAllMachines() {

        List<Machine> machines =
                machineRepository.findAll();

        for (Machine machine : machines) {

            checkAndCreateMaintenanceTask(machine);
        }
    }

    // Complete a maintenance task
    public MaintenanceTask completeTask(
            Long taskId,
            String notes) {

        MaintenanceTask task =
                maintenanceTaskRepository.findById(taskId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Maintenance task not found"
                                ));

        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new RuntimeException(
                    "Maintenance task is already completed"
            );
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setNotes(notes);
        task.setCompletedAt(LocalDateTime.now());

        Machine machine = task.getMachine();

        // Reset maintenance cycle
        machine.setCurrentUsageHours(0.0);
        machine.setLastMaintenanceDate(LocalDate.now());

        machineRepository.save(machine);

        return maintenanceTaskRepository.save(task);
    }

    // Get all maintenance tasks
    public List<MaintenanceTask> getAllTasks() {
        return maintenanceTaskRepository.findAll();
    }

    // Get task by ID
    public MaintenanceTask getTaskById(Long id) {

        return maintenanceTaskRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Maintenance task not found"
                        ));
    }

    // Get tasks by machine
    public List<MaintenanceTask> getTasksByMachine(
            Long machineId) {

        return maintenanceTaskRepository
                .findByMachineId(machineId);
    }

    // Get all OPEN tasks
    public List<MaintenanceTask> getOpenTasks() {

        return maintenanceTaskRepository
                .findByStatus(TaskStatus.OPEN);
    }

    public List<Machine> getOverdueMachines() {

        List<Machine> machines =
                machineRepository.findAll();

        List<Machine> overdueMachines =
                new ArrayList<>();

        LocalDate today = LocalDate.now();

        for (Machine machine : machines) {

            boolean overdue = false;

            // HOURS based maintenance
            if (machine.getMaintenanceType() == MaintenanceType.HOURS) {

                Double currentUsage =
                        machine.getCurrentUsageHours();

                if (currentUsage != null &&
                        currentUsage >= machine.getIntervalValue()) {

                    overdue = true;
                }
            }

            // DAYS based maintenance
            else if (machine.getMaintenanceType() == MaintenanceType.DAYS) {

                LocalDate dueDate =
                        machine.getLastMaintenanceDate()
                                .plusDays(
                                        machine.getIntervalValue()
                                );

                if (today.isAfter(dueDate)) {
                    overdue = true;
                }
            }

            if (overdue) {
                overdueMachines.add(machine);
            }
        }

        return overdueMachines;
    }
}