package com.example.maintenance_scheduler.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "usage_logs")
public class UsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double usageHours;

    private LocalDateTime loggedAt;

    @ManyToOne
    @JoinColumn(name = "machine_id", nullable = false)
    private Machine machine;

    public UsageLog() {
    }

    public UsageLog(Double usageHours, LocalDateTime loggedAt, Machine machine) {
        this.usageHours = usageHours;
        this.loggedAt = loggedAt;
        this.machine = machine;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getUsageHours() {
        return usageHours;
    }

    public void setUsageHours(Double usageHours) {
        this.usageHours = usageHours;
    }

    public LocalDateTime getLoggedAt() {
        return loggedAt;
    }

    public void setLoggedAt(LocalDateTime loggedAt) {
        this.loggedAt = loggedAt;
    }

    public Machine getMachine() {
        return machine;
    }

    public void setMachine(Machine machine) {
        this.machine = machine;
    }
}