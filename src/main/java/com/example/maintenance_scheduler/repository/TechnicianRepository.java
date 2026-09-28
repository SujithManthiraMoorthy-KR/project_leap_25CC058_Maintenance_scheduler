package com.example.maintenance_scheduler.repository;

import com.example.maintenance_scheduler.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TechnicianRepository extends JpaRepository<Technician, Long> {
}