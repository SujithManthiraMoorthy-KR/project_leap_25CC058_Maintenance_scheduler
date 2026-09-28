package com.example.maintenance_scheduler.controller;

import com.example.maintenance_scheduler.entity.Technician;
import com.example.maintenance_scheduler.service.TechnicianService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
public class TechnicianController {

    private final TechnicianService technicianService;

    public TechnicianController(TechnicianService technicianService) {
        this.technicianService = technicianService;
    }

    @PostMapping
    public Technician createTechnician(
            @Valid @RequestBody Technician technician) {

        return technicianService.createTechnician(technician);
    }

    @GetMapping
    public List<Technician> getAllTechnicians() {
        return technicianService.getAllTechnicians();
    }

    @GetMapping("/{id}")
    public Technician getTechnicianById(@PathVariable Long id) {
        return technicianService.getTechnicianById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteTechnician(@PathVariable Long id) {
        technicianService.deleteTechnician(id);

        return "Technician deleted successfully";
    }
}