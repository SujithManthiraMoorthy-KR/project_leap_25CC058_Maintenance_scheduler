package com.example.maintenance_scheduler.service;

import com.example.maintenance_scheduler.entity.Machine;
import com.example.maintenance_scheduler.entity.UsageLog;
import com.example.maintenance_scheduler.repository.MachineRepository;
import com.example.maintenance_scheduler.repository.UsageLogRepository;
import org.springframework.stereotype.Service;
import com.example.maintenance_scheduler.exception.ResourceNotFoundException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UsageLogService {

    private final UsageLogRepository usageLogRepository;
    private final MachineRepository machineRepository;
    private final MaintenanceTaskService maintenanceTaskService;

    public UsageLogService(
            UsageLogRepository usageLogRepository,
            MachineRepository machineRepository,
            MaintenanceTaskService maintenanceTaskService) {

        this.usageLogRepository = usageLogRepository;
        this.machineRepository = machineRepository;
        this.maintenanceTaskService = maintenanceTaskService;
    }

    public UsageLog logUsage(Long machineId, Double usageHours) {

        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Machine not found"));

        UsageLog usageLog = new UsageLog();

        usageLog.setUsageHours(usageHours);
        usageLog.setLoggedAt(LocalDateTime.now());
        usageLog.setMachine(machine);

        // Get current usage
        Double currentUsage = machine.getCurrentUsageHours();

        if (currentUsage == null) {
            currentUsage = 0.0;
        }

        // Add new usage
        machine.setCurrentUsageHours(
                currentUsage + usageHours
        );

        // Save updated machine
        machineRepository.save(machine);

        // Save usage log
        UsageLog savedLog = usageLogRepository.save(usageLog);

        // Check whether maintenance is now needed
        maintenanceTaskService.checkAndCreateMaintenanceTask(machine);

        return savedLog;
    }

    public List<UsageLog> getUsageLogsByMachine(Long machineId) {

        return usageLogRepository.findByMachineId(machineId);
    }
}