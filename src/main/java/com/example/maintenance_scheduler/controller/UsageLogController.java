package com.example.maintenance_scheduler.controller;

import com.example.maintenance_scheduler.entity.UsageLog;
import com.example.maintenance_scheduler.service.UsageLogService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.constraints.Positive;
import java.util.List;

@RestController
@RequestMapping("/api/usage")
public class UsageLogController {

    private final UsageLogService usageLogService;

    public UsageLogController(UsageLogService usageLogService) {
        this.usageLogService = usageLogService;
    }

    @PostMapping("/{machineId}")
    public UsageLog logUsage(
            @PathVariable Long machineId,
            @RequestParam @Positive(message = "Usage hours must be greater than 0")
            Double usageHours) {

        return usageLogService.logUsage(machineId, usageHours);
    }

    @GetMapping("/machine/{machineId}")
    public List<UsageLog> getUsageLogsByMachine(
            @PathVariable Long machineId) {

        return usageLogService.getUsageLogsByMachine(machineId);
    }
}