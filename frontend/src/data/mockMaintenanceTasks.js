export const initialMockMaintenanceTasks = [
  {
    id: 101,
    machine: {
      id: 1,
      name: "CNC Milling Machine M-101",
      code: "CNC-01",
      maintenanceType: "HOURS",
      intervalValue: 100,
      currentUsageHours: 92.5,
      lastMaintenanceDate: "2026-08-15"
    },
    technician: {
      id: 1,
      name: "Alex Rivera",
      specialization: "Hydraulics & Heavy Motors",
      phone: "+1 (555) 234-5678"
    },
    status: "OPEN",
    dueDate: null,
    dueUsageHours: 100.0,
    notes: "Spindle vibration inspection & lubricant replacement required",
    completedAt: null
  },
  {
    id: 102,
    machine: {
      id: 3,
      name: "Industrial Conveyor Belt C-50",
      code: "CONV-05",
      maintenanceType: "HOURS",
      intervalValue: 200,
      currentUsageHours: 215.0,
      lastMaintenanceDate: "2026-07-10"
    },
    technician: {
      id: 3,
      name: "Marcus Vance",
      specialization: "HVAC & Pneumatic Systems",
      phone: "+1 (555) 345-6789"
    },
    status: "OPEN",
    dueDate: null,
    dueUsageHours: 200.0,
    notes: "OVERDUE: Belt tensioning & motor bearing greasing urgent",
    completedAt: null
  },
  {
    id: 103,
    machine: {
      id: 2,
      name: "Hydraulic Press P-200",
      code: "PRESS-02",
      maintenanceType: "DAYS",
      intervalValue: 30,
      currentUsageHours: 45.0,
      lastMaintenanceDate: "2026-08-25"
    },
    technician: {
      id: 2,
      name: "Sarah Chen",
      specialization: "Electrical & Sensor Calibration",
      phone: "+1 (555) 876-5432"
    },
    status: "COMPLETED",
    dueDate: "2026-09-24",
    dueUsageHours: null,
    notes: "Replaced hydraulic seal & checked pressure sensors. All systems normal.",
    completedAt: "2026-09-25T10:30:00"
  }
];
