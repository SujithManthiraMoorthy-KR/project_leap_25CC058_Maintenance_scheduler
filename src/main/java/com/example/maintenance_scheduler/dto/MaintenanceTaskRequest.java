package com.example.maintenance_scheduler.dto;

import jakarta.validation.constraints.NotNull;

public class MaintenanceTaskRequest {

    @NotNull(message = "Machine ID is required")
    private Long machineId;

    @NotNull(message = "Technician ID is required")
    private Long technicianId;

    private String notes;

    public MaintenanceTaskRequest() {
    }

    public Long getMachineId() {
        return machineId;
    }

    public void setMachineId(Long machineId) {
        this.machineId = machineId;
    }

    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}