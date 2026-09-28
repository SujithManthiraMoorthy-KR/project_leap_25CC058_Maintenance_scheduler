package com.example.maintenance_scheduler.repository;

import com.example.maintenance_scheduler.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MachineRepository extends JpaRepository<Machine, Long> {

    Optional<Machine> findByCode(String code);
}