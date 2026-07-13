import { useState } from 'react';
import { Search, ChevronUp, ChevronDown, ClipboardList, FileSpreadsheet } from 'lucide-react';
import type { Employee, EmployeeRole } from '../../services/employeeApi';
import { cn } from '../../utils/cn';

interface EmployeeTableProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
}

type SortKey = 'fullName' | 'role' | 'salary' | 'totalHoursWorked' | 'totalOvertimeHours' | 'hireDate';

const ROLE_BADGE: Record<EmployeeRole, { label: string; classes: string }> = {
  Admin:   { label: 'Admin',   classes: 'bg-violet-50 text-violet-700 ring-violet-600/20' },
  Manager: { label: 'Manager', classes: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  Staff:   { label: 'Staff',   classes: 'bg-slate-50 text-slate-600 ring-slate-500/20' },
  Vendor:  { label: 'Vendor',  classes: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
};

function RoleBadge({ role }: { role: EmployeeRole }) {
  const { label, classes } = ROLE_BADGE[role];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', classes)}>
      {label}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-500/20">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Inactive
    </span>
  );
}

export function EmployeeTable({ employees, onSelectEmployee }: EmployeeTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('fullName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp className={cn('h-3 w-3 -mb-1', sortKey === col && sortDir === 'asc' ? 'text-indigo-500' : 'text-slate-300')} />
      <ChevronDown className={cn('h-3 w-3', sortKey === col && sortDir === 'desc' ? 'text-indigo-500' : 'text-slate-300')} />
    </span>
  );

  const filtered = employees
    .filter(e => {
      const q = search.toLowerCase();
      const matchesSearch = !q || e.fullName.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'All' || e.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? e.isActive : !e.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(String(bVal)) : Number(aVal) - Number(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const Th = ({ col, children }: { col: SortKey; children: React.ReactNode }) => (
    <th
      className="cursor-pointer select-none whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
      onClick={() => handleSort(col)}
    >
      <span className="inline-flex items-center">
        {children}
        <SortIcon col={col} />
      </span>
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-48 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
        >
          <option value="All">All Roles</option>
          <option>Admin</option>
          <option>Manager</option>
          <option>Staff</option>
          <option>Vendor</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
        >
          <option value="All">All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <div className="ml-auto text-xs font-semibold text-slate-400">
          {filtered.length} of {employees.length} employees
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <ClipboardList className="h-10 w-10 text-slate-200 mb-3" />
            <p className="text-sm font-semibold text-slate-600">No employees match your filters</p>
            <p className="text-xs mt-1">Try adjusting the search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <Th col="fullName">Employee</Th>
                  <Th col="role">Role</Th>
                  <Th col="salary">Salary</Th>
                  <Th col="totalHoursWorked">Total Hours</Th>
                  <Th col="totalOvertimeHours">Overtime</Th>
                  <Th col="hireDate">Hire Date</Th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(emp => (
                  <tr key={emp.id} className="group transition-colors hover:bg-indigo-50/40">
                    {/* Employee cell */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-white shadow-sm">
                          {emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{emp.fullName}</p>
                          <p className="text-xs text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <RoleBadge role={emp.role} />
                    </td>

                    {/* Salary */}
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-700">
                      ${emp.salary.toLocaleString()}
                      <span className="ml-1 text-xs font-normal text-slate-400">/yr</span>
                    </td>

                    {/* Total Hours */}
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {emp.totalHoursWorked.toLocaleString()} h
                    </td>

                    {/* Overtime — highlight if significant */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={cn(
                        'font-bold',
                        emp.totalOvertimeHours > 60 ? 'text-rose-600' :
                        emp.totalOvertimeHours > 30 ? 'text-amber-500' :
                        'text-slate-600'
                      )}>
                        {emp.totalOvertimeHours} h
                      </span>
                    </td>

                    {/* Hire Date */}
                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                      {new Date(emp.hireDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <StatusBadge isActive={emp.isActive} />
                    </td>

                    {/* Action */}
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        onClick={() => onSelectEmployee(emp)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-sm opacity-0 group-hover:opacity-100"
                        title="View Work Logs"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        View Logs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
