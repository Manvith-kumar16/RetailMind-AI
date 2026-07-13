import { useEffect, useState } from 'react';
import { Users, Clock, TrendingUp, AlertTriangle, Loader2, UserPlus } from 'lucide-react';
import { employeeApi } from '../services/employeeApi';
import type { Employee } from '../services/employeeApi';
import { EmployeeTable } from '../components/employees/EmployeeTable';
import { WorkLogPanel } from '../components/employees/WorkLogPanel';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accentClass: string;
}

function StatCard({ label, value, sub, icon, accentClass }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
      <div className={`absolute right-0 top-0 h-32 w-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${accentClass}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-sm font-medium text-slate-400">{sub}</p>}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${accentClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    employeeApi.getEmployees().then(data => {
      setEmployees(data);
      setIsLoading(false);
    });
  }, []);

  // Derived metrics
  const activeCount = employees.filter(e => e.isActive).length;
  const totalPayroll = employees.filter(e => e.isActive).reduce((s, e) => s + e.salary, 0);
  const totalOT = employees.reduce((s, e) => s + e.totalOvertimeHours, 0);
  const overtimeRisk = employees.filter(e => e.totalOvertimeHours > 60).length;

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
                <Users className="h-5 w-5" />
              </div>
              Employee Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your workforce, track logged hours, and monitor overtime compliance.
            </p>
          </div>
          <button className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/30 active:translate-y-0">
            <UserPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
            Add Employee
          </button>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Active Staff"
              value={activeCount}
              sub={`${employees.length - activeCount} inactive`}
              icon={<Users className="h-6 w-6 text-white" />}
              accentClass="bg-indigo-500"
            />
            <StatCard
              label="Monthly Payroll Run"
              value={`$${(totalPayroll / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              sub={`$${totalPayroll.toLocaleString()} annual`}
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              accentClass="bg-emerald-500"
            />
            <StatCard
              label="Total Overtime Hours"
              value={`${totalOT} h`}
              sub="All active employees (YTD)"
              icon={<Clock className="h-6 w-6 text-white" />}
              accentClass="bg-amber-500"
            />
            <StatCard
              label="Overtime Risk"
              value={overtimeRisk}
              sub="Employees exceeding 60 OT hours"
              icon={<AlertTriangle className="h-6 w-6 text-white" />}
              accentClass="bg-rose-500"
            />
          </div>
        )}

        {/* Table Section */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">Staff Roster</h2>
            {!isLoading && (
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-600">
                {employees.length} total
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                <p className="text-sm font-semibold">Loading employee data...</p>
              </div>
            </div>
          ) : (
            <EmployeeTable
              employees={employees}
              onSelectEmployee={setSelectedEmployee}
            />
          )}
        </div>
      </div>

      {/* Slide-in Work Log Panel */}
      <WorkLogPanel
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />
    </>
  );
}
