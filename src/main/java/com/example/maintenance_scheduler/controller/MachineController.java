package com.example.maintenance_scheduler.controller;

import com.example.maintenance_scheduler.entity.Machine;
import com.example.maintenance_scheduler.service.MachineService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
public class MachineController {

    private final MachineService machineService;

    public MachineController(MachineService machineService) {
        this.machineService = machineService;
    }

    @PostMapping
    public Machine createMachine(@Valid @RequestBody Machine machine) {
        return machineService.createMachine(machine);
    }

    @GetMapping
    public List<Machine> getAllMachines() {
        return machineService.getAllMachines();
    }

    @GetMapping("/{id}")
    public Machine getMachineById(@PathVariable Long id) {
        return machineService.getMachineById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteMachine(@PathVariable Long id) {
        machineService.deleteMachine(id);

        return "Machine deleted successfully";
    }
}