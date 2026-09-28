package com.example.maintenance_scheduler.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Entity
@Table(name = "machines")
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Machine name is required")
    private String name;

    @NotBlank(message = "Machine code is required")
    @Column(unique = true, nullable = false)
    private String code;

    @NotNull(message = "Maintenance type is required")
    @Enumerated(EnumType.STRING)
    private MaintenanceType maintenanceType;

    @NotNull(message = "Maintenance interval is required")
    @Min(value = 1, message = "Maintenance interval must be greater than 0")
    private Integer intervalValue;

    @Min(value = 0, message = "Usage hours cannot be negative")
    private Double currentUsageHours;

    private LocalDate lastMaintenanceDate;

    public Machine() {
    }

    public Machine(String name, String code, MaintenanceType maintenanceType,
                   Integer intervalValue, Double currentUsageHours,
                   LocalDate lastMaintenanceDate) {

        this.name = name;
        this.code = code;
        this.maintenanceType = maintenanceType;
        this.intervalValue = intervalValue;
        this.currentUsageHours = currentUsageHours;
        this.lastMaintenanceDate = lastMaintenanceDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public MaintenanceType getMaintenanceType() {
        return maintenanceType;
    }

    public void setMaintenanceType(MaintenanceType maintenanceType) {
        this.maintenanceType = maintenanceType;
    }

    public Integer getIntervalValue() {
        return intervalValue;
    }

    public void setIntervalValue(Integer intervalValue) {
        this.intervalValue = intervalValue;
    }

    public Double getCurrentUsageHours() {
        return currentUsageHours;
    }

    public void setCurrentUsageHours(Double currentUsageHours) {
        this.currentUsageHours = currentUsageHours;
    }

    public LocalDate getLastMaintenanceDate() {
        return lastMaintenanceDate;
    }

    public void setLastMaintenanceDate(LocalDate lastMaintenanceDate) {
        this.lastMaintenanceDate = lastMaintenanceDate;
    }
}