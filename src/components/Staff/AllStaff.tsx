"use client";

import {
  Eye,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
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

import { selectCurrentUser } from "@/Redux/Features/Auth/authSlice";
import { useAppSelector } from "@/Redux/hook";

import api from "@/lib/axios";
import CreateStaffModal from "./CreateStaffModal";
import EditStaffModal from "./EditStaffModal";
import StaffStatusDialog from "./StaffStatusDialog";
import ViewStaffModal from "./ViewStaffModal";

export type StaffRole =
  | "GILBRICE_SUPER_ADMIN"
  | "GILBRICE_ADMIN"
  | "GILBRICE_FINANCE";

export type StaffStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";

export type Staff = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: StaffRole;
  status: StaffStatus;
  createdAt: string;
  updatedAt: string;
};

const roleLabels: Record<StaffRole, string> = {
  GILBRICE_SUPER_ADMIN: "Super Admin",
  GILBRICE_ADMIN: "Admin",
  GILBRICE_FINANCE: "Finance",
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function AllStaff() {
  const currentUser = useAppSelector(selectCurrentUser);

  const [staff, setStaff] = useState<Staff[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [createOpen, setCreateOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewStaff, setViewStaff] = useState<Staff | null>(null);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusStaff, setStatusStaff] = useState<Staff | null>(null);

  const isSuperAdmin = currentUser?.role === "GILBRICE_SUPER_ADMIN";

  // ============================================================
  // FETCH STAFF
  // ============================================================

  const fetchStaff = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/api/v1/user/staff`);

      const data = response.data?.data ?? response.data;

      setStaff(data);
    } catch (error) {
      console.error("Failed to load staff:", error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredStaff = useMemo(() => {
    const text = search.toLowerCase().trim();

    return staff.filter((member) => {
      const matchesSearch =
        !text ||
        member.fullName.toLowerCase().includes(text) ||
        member.email.toLowerCase().includes(text) ||
        member.phone?.toLowerCase().includes(text);

      const matchesStatus =
        statusFilter === "ALL" || member.status === statusFilter;

      const matchesRole = roleFilter === "ALL" || member.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [staff, search, statusFilter, roleFilter]);

  // ============================================================
  // STATS
  // ============================================================

  const totalStaff = staff.length;

  const activeStaff = staff.filter(
    (member) => member.status === "ACTIVE",
  ).length;

  const suspendedStaff = staff.filter(
    (member) => member.status !== "ACTIVE",
  ).length;

  const adminCount = staff.filter(
    (member) =>
      member.role === "GILBRICE_ADMIN" ||
      member.role === "GILBRICE_SUPER_ADMIN",
  ).length;

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleView = (member: Staff) => {
    setViewStaff(member);
    setViewOpen(true);
  };

  const handleEdit = (member: Staff) => {
    setSelectedStaff(member);
    setEditOpen(true);
  };

  const handleStatus = (member: Staff) => {
    setStatusStaff(member);
    setStatusOpen(true);
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
            Manage Gilbrice staff accounts and access levels.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStaff} disabled={loading}>
            <RefreshCw
              size={17}
              className={loading ? "mr-2 animate-spin" : "mr-2"}
            />
            Refresh
          </Button>

          {isSuperAdmin && (
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
          value={totalStaff}
          icon={<UserCog size={20} />}
        />

        <SummaryCard
          title="Active"
          value={activeStaff}
          icon={<UserCheck size={20} />}
        />

        <SummaryCard
          title="Suspended"
          value={suspendedStaff}
          icon={<UserX size={20} />}
        />

        <SummaryCard
          title="Admins"
          value={adminCount}
          icon={<ShieldCheck size={20} />}
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
              <SelectItem value="GILBRICE_SUPER_ADMIN">Super Admin</SelectItem>
              <SelectItem value="GILBRICE_ADMIN">Admin</SelectItem>
              <SelectItem value="GILBRICE_FINANCE">Finance</SelectItem>
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
          <table className="w-full min-w-[950px] text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Staff</th>

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
              ) : filteredStaff.length === 0 ? (
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
                filteredStaff.map((member) => (
                  <tr key={member.id} className="transition hover:bg-slate-50">
                    {/* Staff */}

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>

                        <p className="font-semibold text-slate-800">
                          {member.fullName}
                        </p>
                      </div>
                    </td>

                    {/* Contact */}

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail size={14} className="text-slate-400" />

                        {member.email}
                      </div>

                      {member.phone && (
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Phone size={13} className="text-slate-400" />

                          {member.phone}
                        </div>
                      )}
                    </td>

                    {/* Role */}

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {roleLabels[member.role]}
                      </span>
                    </td>

                    {/* Status */}

                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => isSuperAdmin && handleStatus(member)}
                        disabled={!isSuperAdmin}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          member.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        } ${!isSuperAdmin ? "cursor-default opacity-80" : ""}`}
                      >
                        {member.status}
                      </button>
                    </td>

                    {/* Joined */}

                    <td className="px-4 py-4 text-slate-500">
                      {formatDate(member.createdAt)}
                    </td>

                    {/* Actions */}

                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          title="View"
                          onClick={() => handleView(member)}
                        >
                          <Eye size={17} />
                        </Button>

                        {isSuperAdmin && (
                          <Button
                            size="icon"
                            variant="outline"
                            title="Edit"
                            onClick={() => handleEdit(member)}
                          >
                            <Pencil size={17} />
                          </Button>
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

      <CreateStaffModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchStaff}
      />

      <EditStaffModal
        open={editOpen}
        onOpenChange={setEditOpen}
        staff={selectedStaff}
        onSuccess={fetchStaff}
      />

      <ViewStaffModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        staff={viewStaff}
      />

      <StaffStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        staff={statusStaff}
        onSuccess={fetchStaff}
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
