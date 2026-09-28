package com.example.maintenance_scheduler.config;

import com.example.maintenance_scheduler.entity.*;
import com.example.maintenance_scheduler.repository.*;
import com.example.maintenance_scheduler.service.MaintenanceTaskService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final MachineRepository machineRepository;
    private final TechnicianRepository technicianRepository;
    private final MaintenanceTaskRepository maintenanceTaskRepository;
    private final UsageLogRepository usageLogRepository;
    private final MaintenanceTaskService maintenanceTaskService;

    public DataInitializer(MachineRepository machineRepository,
                           TechnicianRepository technicianRepository,
                           MaintenanceTaskRepository maintenanceTaskRepository,
                           UsageLogRepository usageLogRepository,
                           MaintenanceTaskService maintenanceTaskService) {
        this.machineRepository = machineRepository;
        this.technicianRepository = technicianRepository;
        this.maintenanceTaskRepository = maintenanceTaskRepository;
        this.usageLogRepository = usageLogRepository;
        this.maintenanceTaskService = maintenanceTaskService;
    }

    @Override
    public void run(String... args) throws Exception {
        if (machineRepository.count() == 0) {
            // Seed Technicians
            Technician t1 = technicianRepository.save(new Technician("Alex Rivera", "Hydraulics & Heavy Motors", "+1 (555) 234-5678"));
            Technician t2 = technicianRepository.save(new Technician("Sarah Chen", "Electrical & Sensor Calibration", "+1 (555) 876-5432"));
            Technician t3 = technicianRepository.save(new Technician("Marcus Vance", "HVAC & Pneumatic Systems", "+1 (555) 345-6789"));
            Technician t4 = technicianRepository.save(new Technician("Elena Rostova", "CNC Robotics & Laser Optics", "+1 (555) 901-2345"));

            // Seed Machines
            Machine m1 = machineRepository.save(new Machine(
                    "CNC Milling Machine M-101", "CNC-01", MaintenanceType.HOURS,
                    100, 92.5, LocalDate.now().minusDays(30)
            ));

            Machine m2 = machineRepository.save(new Machine(
                    "Hydraulic Press P-200", "PRESS-02", MaintenanceType.DAYS,
                    30, 45.0, LocalDate.now().minusDays(25)
            ));

            Machine m3 = machineRepository.save(new Machine(
                    "Industrial Conveyor Belt C-50", "CONV-05", MaintenanceType.HOURS,
                    200, 215.0, LocalDate.now().minusDays(60)
            ));

            Machine m4 = machineRepository.save(new Machine(
                    "Precision Laser Cutter L-90", "LASER-09", MaintenanceType.DAYS,
                    14, 12.0, LocalDate.now().minusDays(2)
            ));

            Machine m5 = machineRepository.save(new Machine(
                    "Automated Robotic Arm R-300", "ROBOT-03", MaintenanceType.HOURS,
                    150, 138.0, LocalDate.now().minusDays(15)
            ));

            // Trigger maintenance checks to auto-create tasks for machines reaching 90% threshold
            maintenanceTaskService.checkAllMachines();
        }
    }
}
