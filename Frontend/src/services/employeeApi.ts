// Mock Employee API Service
// Matches the C# EmployeeResponseDto and WorkLogResponseDto exactly.
// Ready to swap for real API calls when backend is connected.

export type EmployeeRole = 'Admin' | 'Manager' | 'Staff' | 'Vendor';

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: EmployeeRole;
  salary: number;
  hireDate: string; // ISO date string
  isActive: boolean;
  totalHoursWorked: number;
  totalOvertimeHours: number;
}

export interface WorkLog {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string; // ISO date string
  hoursWorked: number;
  isOvertime: boolean;
  notes: string | null;
}

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 1, fullName: 'Sarah Mitchell', email: 'sarah.m@retailmind.ai', phone: '+1 (555) 201-4892',
    role: 'Admin', salary: 95000, hireDate: '2021-03-15', isActive: true,
    totalHoursWorked: 1840, totalOvertimeHours: 64,
  },
  {
    id: 2, fullName: 'James Okafor', email: 'james.o@retailmind.ai', phone: '+1 (555) 307-0021',
    role: 'Manager', salary: 78000, hireDate: '2022-06-01', isActive: true,
    totalHoursWorked: 1760, totalOvertimeHours: 48,
  },
  {
    id: 3, fullName: 'Priya Nair', email: 'priya.n@retailmind.ai', phone: '+1 (555) 118-7734',
    role: 'Staff', salary: 52000, hireDate: '2023-01-10', isActive: true,
    totalHoursWorked: 1680, totalOvertimeHours: 16,
  },
  {
    id: 4, fullName: 'Carlos Reyes', email: 'carlos.r@retailmind.ai', phone: '+1 (555) 490-5523',
    role: 'Staff', salary: 49500, hireDate: '2022-11-20', isActive: true,
    totalHoursWorked: 1720, totalOvertimeHours: 32,
  },
  {
    id: 5, fullName: 'Aisha Kowalski', email: 'aisha.k@retailmind.ai', phone: null,
    role: 'Vendor', salary: 65000, hireDate: '2023-05-08', isActive: false,
    totalHoursWorked: 540, totalOvertimeHours: 0,
  },
  {
    id: 6, fullName: 'David Chen', email: 'david.c@retailmind.ai', phone: '+1 (555) 882-1199',
    role: 'Manager', salary: 81000, hireDate: '2020-09-01', isActive: true,
    totalHoursWorked: 1920, totalOvertimeHours: 96,
  },
  {
    id: 7, fullName: 'Fatima Al-Hassan', email: 'fatima.a@retailmind.ai', phone: '+1 (555) 664-3301',
    role: 'Staff', salary: 51000, hireDate: '2024-02-14', isActive: true,
    totalHoursWorked: 800, totalOvertimeHours: 8,
  },
  {
    id: 8, fullName: 'Tom Nguyen', email: 'tom.n@retailmind.ai', phone: '+1 (555) 231-5500',
    role: 'Staff', salary: 50000, hireDate: '2023-08-30', isActive: true,
    totalHoursWorked: 1560, totalOvertimeHours: 24,
  },
];

const MOCK_WORK_LOGS: Record<number, WorkLog[]> = {
  1: [
    { id: 101, employeeId: 1, employeeName: 'Sarah Mitchell', date: '2026-03-29', hoursWorked: 9.5, isOvertime: true, notes: 'Month-end audit review.' },
    { id: 102, employeeId: 1, employeeName: 'Sarah Mitchell', date: '2026-03-28', hoursWorked: 8.0, isOvertime: false, notes: null },
    { id: 103, employeeId: 1, employeeName: 'Sarah Mitchell', date: '2026-03-27', hoursWorked: 10.0, isOvertime: true, notes: 'Q1 closing sprint.' },
    { id: 104, employeeId: 1, employeeName: 'Sarah Mitchell', date: '2026-03-26', hoursWorked: 8.0, isOvertime: false, notes: null },
    { id: 105, employeeId: 1, employeeName: 'Sarah Mitchell', date: '2026-03-25', hoursWorked: 7.5, isOvertime: false, notes: 'Half-day remote.' },
  ],
  2: [
    { id: 201, employeeId: 2, employeeName: 'James Okafor', date: '2026-03-29', hoursWorked: 9.0, isOvertime: true, notes: 'Inventory reconciliation.' },
    { id: 202, employeeId: 2, employeeName: 'James Okafor', date: '2026-03-28', hoursWorked: 8.0, isOvertime: false, notes: null },
    { id: 203, employeeId: 2, employeeName: 'James Okafor', date: '2026-03-27', hoursWorked: 8.0, isOvertime: false, notes: null },
    { id: 204, employeeId: 2, employeeName: 'James Okafor', date: '2026-03-26', hoursWorked: 8.5, isOvertime: false, notes: 'Late team standup.' },
    { id: 205, employeeId: 2, employeeName: 'James Okafor', date: '2026-03-25', hoursWorked: 8.0, isOvertime: false, notes: null },
  ],
  3: [
    { id: 301, employeeId: 3, employeeName: 'Priya Nair', date: '2026-03-29', hoursWorked: 8.0, isOvertime: false, notes: null },
    { id: 302, employeeId: 3, employeeName: 'Priya Nair', date: '2026-03-28', hoursWorked: 8.0, isOvertime: false, notes: null },
    { id: 303, employeeId: 3, employeeName: 'Priya Nair', date: '2026-03-27', hoursWorked: 9.5, isOvertime: true, notes: 'Rush shipment processing.' },
  ],
};

// Simulate API delay
const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const employeeApi = {
  getEmployees: async (): Promise<Employee[]> => {
    await delay();
    return MOCK_EMPLOYEES;
  },

  getWorkLogs: async (employeeId: number): Promise<WorkLog[]> => {
    await delay(400);
    return MOCK_WORK_LOGS[employeeId] ?? [];
  },
};
