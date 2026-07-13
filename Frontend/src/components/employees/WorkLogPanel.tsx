import { useEffect, useState } from 'react';
import { X, Clock, AlertTriangle, FileText, Loader2, CalendarDays } from 'lucide-react';
import { employeeApi } from '../../services/employeeApi';
import type { Employee, WorkLog } from '../../services/employeeApi';
import { cn } from '../../utils/cn';

interface WorkLogPanelProps {
  employee: Employee | null;
  onClose: () => void;
}

export function WorkLogPanel({ employee, onClose }: WorkLogPanelProps) {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!employee) return;
    setLogs([]);
    setIsLoading(true);
    employeeApi.getWorkLogs(employee.id).then(data => {
      setLogs(data);
      setIsLoading(false);
    });
  }, [employee]);

  const overtimeCount = logs.filter(l => l.isOvertime).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300',
          employee ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <aside
        className={cn(
          'fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-400 ease-in-out border-l border-slate-200',
          employee ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between bg-slate-900 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-base font-bold text-white ring-2 ring-white/20">
              {employee?.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-base font-bold text-white">{employee?.fullName}</p>
              <p className="text-xs font-medium text-slate-400">{employee?.role} · Work Log History</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary Metrics */}
        {employee && (
          <div className="grid grid-cols-3 gap-px bg-slate-100 border-b border-slate-200">
            <div className="bg-white px-5 py-4 text-center">
              <p className="text-xl font-black text-slate-900">{employee.totalHoursWorked.toLocaleString()}</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Hours</p>
            </div>
            <div className="bg-white px-5 py-4 text-center">
              <p className={cn('text-xl font-black', employee.totalOvertimeHours > 40 ? 'text-rose-600' : 'text-amber-500')}>
                {employee.totalOvertimeHours}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">OT Hours</p>
            </div>
            <div className="bg-white px-5 py-4 text-center">
              <p className="text-xl font-black text-indigo-600">{overtimeCount}</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">OT Days</p>
            </div>
          </div>
        )}

        {/* Log List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Recent Log Entries
          </h3>

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
            </div>
          )}

          {!isLoading && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FileText className="h-10 w-10 mb-3 text-slate-200" />
              <p className="text-sm font-semibold">No work logs found</p>
              <p className="text-xs mt-1 text-slate-300">Logs will appear here once submitted.</p>
            </div>
          )}

          {!isLoading && logs.map(log => (
            <div
              key={log.id}
              className={cn(
                'group relative flex items-start gap-4 rounded-xl border p-4 transition-all hover:shadow-md',
                log.isOvertime
                  ? 'border-rose-200 bg-rose-50/60 hover:border-rose-300'
                  : 'border-slate-100 bg-white hover:border-indigo-200'
              )}
            >
              {/* Hours circle */}
              <div className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-black text-sm',
                log.isOvertime ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-700'
              )}>
                {log.hoursWorked}h
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  {log.isOvertime && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 ring-1 ring-rose-200">
                      <AlertTriangle className="h-3 w-3" /> Overtime
                    </span>
                  )}
                </div>
                {log.notes && (
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">{log.notes}</p>
                )}
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{log.hoursWorked} hours logged</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
