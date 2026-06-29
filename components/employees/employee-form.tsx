"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IssueTypeSelect } from "@/components/employees/issue-type-select";
import {
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_STATUSES,
  USER_ROLES,
} from "@/lib/employees/employee-options";

interface Manager {
  id: string;
  full_name: string;
}

interface Props {
  employeeNumber: string;

  fullName: string;
  setFullName: (v: string) => void;

  email: string;
  setEmail: (v: string) => void;

  department: string;
  setDepartment: (v: string) => void;

  role: string;
  setRole: (v: string) => void;

  userRole: string;
  setUserRole: (v: string) => void;

  managerId: string;
  setManagerId: (v: string) => void;

  status: string;
  setStatus: (v: string) => void;

  managers: Manager[];

  saving: boolean;

  onSubmit: () => void;

  submitLabel: string;
}

export function EmployeeForm({
  employeeNumber,

  fullName,
  setFullName,

  email,
  setEmail,

  department,
  setDepartment,

  role,
  setRole,

  userRole,
  setUserRole,

  managerId,
  setManagerId,

  status,
  setStatus,

  managers,

  saving,

  onSubmit,

  submitLabel,
}: Props) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <label className="text-sm font-medium">Employee Number</label>

        <input
          disabled
          value={employeeNumber}
          className="w-full border rounded-lg p-3 mt-2 bg-slate-100"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Full Name</label>

        <input
          className="w-full border rounded-lg p-3 mt-2"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Email</label>

        <input
          className="w-full border rounded-lg p-3 mt-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Department</label>

        <div className="mt-2">
          <IssueTypeSelect
            items={EMPLOYEE_DEPARTMENTS}
            value={department}
            onChange={setDepartment}
            placeholder="Select Department"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Position</label>

        <input
          className="w-full border rounded-lg p-3 mt-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">System Role</label>

        <div className="mt-2">
          <IssueTypeSelect
            items={USER_ROLES}
            value={userRole}
            onChange={setUserRole}
            placeholder="Select System Role"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Manager</label>

        <div className="mt-2">
          <IssueTypeSelect
            items={managers.map((m) => ({
              label: m.full_name,
              value: m.id,
            }))}
            value={managerId}
            onChange={setManagerId}
            placeholder="Select Manager"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Status</label>

        <div className="mt-2">
          <IssueTypeSelect
            items={EMPLOYEE_STATUSES}
            value={status}
            onChange={setStatus}
          />
        </div>
      </div>

      <Button onClick={onSubmit} disabled={saving} className="w-full">
        {saving ? "Saving..." : submitLabel}
      </Button>
    </Card>
  );
}
