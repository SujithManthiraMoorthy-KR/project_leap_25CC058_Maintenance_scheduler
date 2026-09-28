package com.example.maintenance_scheduler.service;

import com.example.maintenance_scheduler.entity.Machine;
import com.example.maintenance_scheduler.exception.ResourceNotFoundException;
import com.example.maintenance_scheduler.repository.MachineRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MachineService {

    private final MachineRepository machineRepository;

    public MachineService(MachineRepository machineRepository) {
        this.machineRepository = machineRepository;
    }

    public Machine createMachine(Machine machine) {

        // Initialize usage hours
        if (machine.getCurrentUsageHours() == null) {
            machine.setCurrentUsageHours(0.0);
        }

        // Initialize maintenance date
        if (machine.getLastMaintenanceDate() == null) {
            machine.setLastMaintenanceDate(LocalDate.now());
        }

        return machineRepository.save(machine);
    }

    public List<Machine> getAllMachines() {
        return machineRepository.findAll();
    }

    public Machine getMachineById(Long id) {

        return machineRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Machine not found"));
    }

    public void deleteMachine(Long id) {

        if (!machineRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Machine not found"
            );
        }

        machineRepository.deleteById(id);
    }


}