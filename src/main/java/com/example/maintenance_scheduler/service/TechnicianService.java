package com.example.maintenance_scheduler.service;

import com.example.maintenance_scheduler.entity.Technician;
import com.example.maintenance_scheduler.repository.TechnicianRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TechnicianService {

    private final TechnicianRepository technicianRepository;

    public TechnicianService(TechnicianRepository technicianRepository) {
        this.technicianRepository = technicianRepository;
    }

    public Technician createTechnician(Technician technician) {
        return technicianRepository.save(technician);
    }

    public List<Technician> getAllTechnicians() {
        return technicianRepository.findAll();
    }

    public Technician getTechnicianById(Long id) {
        return technicianRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Technician not found"));
    }

    public void deleteTechnician(Long id) {
        technicianRepository.deleteById(id);
    }
}