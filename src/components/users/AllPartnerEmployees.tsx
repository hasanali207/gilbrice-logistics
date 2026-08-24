"use client";

import {
  Eye,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  UserCog,
  UserX,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RootState } from "@/Redux/store";
import axios from "axios";
import { useSelector } from "react-redux";
import ChangeEmployeePasswordModal from "./ChangeEmployeePasswordModal";
import CreatePartnerEmployeeModal from "./CreatePartnerEmployeeModal";
import EditPartnerEmployeeModal from "./EditPartnerEmployeeModal";
import PartnerEmployeeStatusDialog from "./PartnerEmployeeStatusDialog";
import ViewPartnerEmployeeModal from "./ViewPartnerEmployeeModal";

const BASE_API =
  process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000/api/v1";

export type PartnerEmployeeRole =
  | "OWNER"
  | "MANAGER"
  | "WAREHOUSE_EMPLOYEE"
  | "CASHIER";

export type EmployeeStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";

export type PartnerEmployee = {
  id: string;
  partnerId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: PartnerEmployeeRole;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
};

const roleLabels: Record<PartnerEmployeeRole, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  WAREHOUSE_EMPLOYEE: "Warehouse Employee",
  CASHIER: "Cashier",
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function AllPartnerEmployees() {
  const user = useSelector((state: RootState) => state.auth.user);
  const partnerId = user?.partnerId as string | undefined;

  const [employees, setEmployees] = useState<PartnerEmployee[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [createOpen, setCreateOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<PartnerEmployee | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewEmployee, setViewEmployee] = useState<PartnerEmployee | null>(
    null,
  );

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusEmployee, setStatusEmployee] = useState<PartnerEmployee | null>(
    null,
  );

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordEmployee, setPasswordEmployee] =
    useState<PartnerEmployee | null>(null);

  const canManage = user?.role === "OWNER" || user?.role === "MANAGER";

  // ============================================================
  // FETCH EMPLOYEES
  // ============================================================

  const fetchEmployees = async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${BASE_API}/partner/${partnerId}/employees`,
        {
          headers: {
            Authorization: token || "",
          },
        },
      );

      const data = response.data?.data ?? response.data;

      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredEmployees = useMemo(() => {
    const text = search.toLowerCase().trim();

    return employees.filter((employee) => {
      const matchesSearch =
        !text ||
        employee.fullName.toLowerCase().includes(text) ||
        employee.email.toLowerCase().includes(text) ||
        employee.phone?.toLowerCase().includes(text);

      const matchesStatus =
        statusFilter === "ALL" || employee.status === statusFilter;

      const matchesRole = roleFilter === "ALL" || employee.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [employees, search, statusFilter, roleFilter]);

  // ============================================================
  // STATS
  // ============================================================

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "ACTIVE",
  ).length;

  const suspendedEmployees = employees.filter(
    (employee) => employee.status !== "ACTIVE",
  ).length;

  const managerCount = employees.filter(
    (employee) => employee.role === "MANAGER" || employee.role === "OWNER",
  ).length;

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleView = (employee: PartnerEmployee) => {
    setViewEmployee(employee);
    setViewOpen(true);
  };

  const handleEdit = (employee: PartnerEmployee) => {
    setSelectedEmployee(employee);
    setEditOpen(true);
  };

  const handleStatus = (employee: PartnerEmployee) => {
    setStatusEmployee(employee);
    setStatusOpen(true);
  };

  const handlePassword = (employee: PartnerEmployee) => {
    setPasswordEmployee(employee);
    setPasswordOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UserCog className="text-blue-600" size={27} />

            <h1 className="text-2xl font-bold text-slate-900">Staff</h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage your team&apos;s accounts and access levels.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEmployees} disabled={loading}>
            <RefreshCw
              size={17}
              className={loading ? "mr-2 animate-spin" : "mr-2"}
            />
            Refresh
          </Button>

          {canManage && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={18} className="mr-2" />
              Add Staff
            </Button>
          )}
        </div>
      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          title="Total Staff"
          value={totalEmployees}
          icon={<UserCog size={20} />}
        />

        <SummaryCard
          title="Active"
          value={activeEmployees}
          icon={<UserCheck size={20} />}
        />

        <SummaryCard
          title="Suspended"
          value={suspendedEmployees}
          icon={<UserX size={20} />}
        />

        <SummaryCard
          title="Managers"
          value={managerCount}
          icon={<KeyRound size={20} />}
        />
      </div>

      {/* ======================================================
          FILTER
      ====================================================== */}

      <div className="mb-5 rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email or phone..."
              className="pl-10"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter role" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="OWNER">Owner</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
              <SelectItem value="WAREHOUSE_EMPLOYEE">
                Warehouse Employee
              </SelectItem>
              <SelectItem value="CASHIER">Cashier</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Employee</th>

                <th className="px-4 py-3 text-left font-semibold">Contact</th>

                <th className="px-4 py-3 text-left font-semibold">Role</th>

                <th className="px-4 py-3 text-center font-semibold">Status</th>

                <th className="px-4 py-3 text-left font-semibold">Joined</th>

                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <RefreshCw
                      size={28}
                      className="mx-auto animate-spin text-blue-600"
                    />

                    <p className="mt-3 text-slate-500">Loading staff...</p>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <UserCog size={42} className="mx-auto text-slate-300" />

                    <p className="mt-3 font-medium text-slate-600">
                      No staff found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Employee */}

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          {employee.fullName.charAt(0).toUpperCase()}
                        </div>

                        <p className="font-semibold text-slate-800">
                          {employee.fullName}
                        </p>
                      </div>
                    </td>

                    {/* Contact */}

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail size={14} className="text-slate-400" />

                        {employee.email}
                      </div>

                      {employee.phone && (
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Phone size={13} className="text-slate-400" />

                          {employee.phone}
                        </div>
                      )}
                    </td>

                    {/* Role */}

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {roleLabels[employee.role]}
                      </span>
                    </td>

                    {/* Status */}

                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => canManage && handleStatus(employee)}
                        disabled={!canManage}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          employee.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        } ${!canManage ? "cursor-default opacity-80" : ""}`}
                      >
                        {employee.status}
                      </button>
                    </td>

                    {/* Joined */}

                    <td className="px-4 py-4 text-slate-500">
                      {formatDate(employee.createdAt)}
                    </td>

                    {/* Actions */}

                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          title="View"
                          onClick={() => handleView(employee)}
                        >
                          <Eye size={17} />
                        </Button>

                        {canManage && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              title="Edit"
                              onClick={() => handleEdit(employee)}
                            >
                              <Pencil size={17} />
                            </Button>

                            <Button
                              size="icon"
                              variant="outline"
                              title="Change Password"
                              onClick={() => handlePassword(employee)}
                            >
                              <KeyRound size={17} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          MODALS
      ====================================================== */}

      <CreatePartnerEmployeeModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        partnerId={partnerId}
        onSuccess={fetchEmployees}
      />

      <EditPartnerEmployeeModal
        open={editOpen}
        onOpenChange={setEditOpen}
        employee={selectedEmployee}
        onSuccess={fetchEmployees}
      />

      <ViewPartnerEmployeeModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        employee={viewEmployee}
      />

      <PartnerEmployeeStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        employee={statusEmployee}
        onSuccess={fetchEmployees}
      />

      <ChangeEmployeePasswordModal
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        employee={passwordEmployee}
      />
    </div>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{title}</p>

        <span className="text-blue-600">{icon}</span>
      </div>

      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
