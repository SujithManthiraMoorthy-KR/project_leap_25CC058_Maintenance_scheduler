package com.example.maintenance_scheduler.service;

import com.example.maintenance_scheduler.entity.Machine;
import com.example.maintenance_scheduler.entity.UsageLog;
import com.example.maintenance_scheduler.repository.MachineRepository;
import com.example.maintenance_scheduler.repository.UsageLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UsageLogService {

    private final UsageLogRepository usageLogRepository;
    private final MachineRepository machineRepository;

    public UsageLogService(UsageLogRepository usageLogRepository,
                           MachineRepository machineRepository) {
        this.usageLogRepository = usageLogRepository;
        this.machineRepository = machineRepository;
    }

    public UsageLog logUsage(Long machineId, Double usageHours) {

        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new RuntimeException("Machine not found"));

        UsageLog usageLog = new UsageLog();

        usageLog.setUsageHours(usageHours);
        usageLog.setLoggedAt(LocalDateTime.now());
        usageLog.setMachine(machine);

        Double currentUsage = machine.getCurrentUsageHours();

        if (currentUsage == null) {
            currentUsage = 0.0;
        }

        machine.setCurrentUsageHours(currentUsage + usageHours);

        machineRepository.save(machine);

        return usageLogRepository.save(usageLog);
    }

    public List<UsageLog> getUsageLogsByMachine(Long machineId) {
        return usageLogRepository.findByMachineId(machineId);
    }
}