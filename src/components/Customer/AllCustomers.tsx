"use client";

import {
  Eye,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

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
import { getDashboardPath } from "@/lib/route";

export type Customer = {
  id: string;
  partnerId: string;

  fullName: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  _count?: {
    shipments: number;
  };

  partner?: {
    id: string;
    companyName: string;
    slug?: string;
    logoUrl?: string | null;
    phone?: string | null;
    email?: string | null;
  };
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function AllCustomers() {
  const currentUser = useAppSelector(selectCurrentUser);
  const basePath = getDashboardPath(currentUser?.role);

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // -------- Edit modal --------
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // -------- View modal --------
  const [viewOpen, setViewOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  // -------- Status toggle modal --------
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusCustomer, setStatusCustomer] = useState<Customer | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // -------- Delete modal --------
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isAdmin =
    currentUser?.role === "GILBRICE_SUPER_ADMIN" ||
    currentUser?.role === "GILBRICE_ADMIN";

  // ============================================================
  // FETCH CUSTOMERS
  // ============================================================

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const response = await api.get(`api/v1/customer`, {});

      const data = response.data?.data ?? response.data;

      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredCustomers = useMemo(() => {
    const text = search.toLowerCase().trim();

    return customers.filter((customer) => {
      const matchesSearch =
        !text ||
        customer.fullName.toLowerCase().includes(text) ||
        customer.phone?.toLowerCase().includes(text) ||
        customer.whatsapp?.toLowerCase().includes(text) ||
        customer.email?.toLowerCase().includes(text);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && customer.isActive) ||
        (statusFilter === "INACTIVE" && !customer.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  // ============================================================
  // STATS
  // ============================================================

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.isActive,
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => !customer.isActive,
  ).length;

  const totalShipments = customers.reduce(
    (total, customer) => total + Number(customer._count?.shipments || 0),
    0,
  );

  // ============================================================
  // HANDLERS — VIEW
  // ============================================================

  const handleView = (customer: Customer) => {
    setViewCustomer(customer);
    setViewOpen(true);
  };

  // ============================================================
  // HANDLERS — EDIT
  // ============================================================

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      fullName: customer.fullName || "",
      phone: customer.phone || "",
      whatsapp: customer.whatsapp || "",
      email: customer.email || "",
      address: customer.address || "",
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) return;

    if (!editForm.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setEditLoading(true);

    try {
      const payload = {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim() || undefined,
        whatsapp: editForm.whatsapp.trim() || undefined,
        email: editForm.email.trim() || undefined,
        address: editForm.address.trim() || undefined,
      };

      const res = await api.patch(
        `/api/v1/customer/${selectedCustomer.id}`,
        payload,
      );

      const updated = res.data?.data ?? { ...selectedCustomer, ...payload };

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomer.id ? { ...c, ...updated } : c,
        ),
      );

      toast.success("Customer updated successfully");
      setEditOpen(false);
      setSelectedCustomer(null);
    } catch (err: any) {
      console.error("Update customer error:", err);
      toast.error(err?.response?.data?.message || "Failed to update customer");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // HANDLERS — STATUS TOGGLE
  // ============================================================

  const handleStatus = (customer: Customer) => {
    setStatusCustomer(customer);
    setStatusOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!statusCustomer) return;

    setStatusLoading(true);

    try {
      const nextStatus = !statusCustomer.isActive;

      await api.patch(`/api/v1/customer/${statusCustomer.id}`, {
        isActive: nextStatus,
      });

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === statusCustomer.id ? { ...c, isActive: nextStatus } : c,
        ),
      );

      toast.success(`Customer marked as ${nextStatus ? "Active" : "Inactive"}`);
      setStatusOpen(false);
      setStatusCustomer(null);
    } catch (err: any) {
      console.error("Status update error:", err);
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  // ============================================================
  // HANDLERS — DELETE
  // ============================================================

  const handleDelete = (customer: Customer) => {
    setDeleteCustomer(customer);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteCustomer) return;

    setDeleteLoading(true);

    try {
      await api.delete(`/api/v1/customer/${deleteCustomer.id}`);

      setCustomers((prev) => prev.filter((c) => c.id !== deleteCustomer.id));

      toast.success("Customer deleted successfully");
      setDeleteOpen(false);
      setDeleteCustomer(null);
    } catch (err: any) {
      console.error("Delete customer error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete customer");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 max-w-7xl mx-auto py-10 px-4">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="text-blue-600" size={27} />

            <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage customers and monitor their shipment activity.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCustomers} disabled={loading}>
            <RefreshCw
              size={17}
              className={loading ? "mr-2 animate-spin" : "mr-2"}
            />
            Refresh
          </Button>

          <Link href={`${basePath}/customers/create`}>
            <Button>
              <Plus size={18} className="mr-2" />
              Add Customer
            </Button>
          </Link>
        </div>
      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          title="Total Customers"
          value={totalCustomers}
          icon={<Users size={20} />}
        />

        <SummaryCard
          title="Active"
          value={activeCustomers}
          icon={<UserCheck size={20} />}
        />

        <SummaryCard
          title="Inactive"
          value={inactiveCustomers}
          icon={<UserX size={20} />}
        />

        <SummaryCard
          title="Total Shipments"
          value={totalShipments}
          icon={<Users size={20} />}
        />
      </div>

      {/* ======================================================
          FILTER
      ====================================================== */}

      <div className="mb-5 rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, WhatsApp or email..."
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">All Customers</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="overflow-x-auto">
        <table className="w-full border text-sm min-w-[900px]">
          <thead className="bg-secondary text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Customer</th>

              <th className="px-4 py-3 text-left font-semibold">Contact</th>

              <th className="px-4 py-3 text-left font-semibold">Address</th>

              <th className="px-4 py-3 text-center font-semibold">Shipments</th>

              <th className="px-4 py-3 text-center font-semibold">Status</th>

              <th className="px-4 py-3 text-left font-semibold">Created</th>

              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <RefreshCw
                    size={28}
                    className="mx-auto animate-spin text-blue-600"
                  />

                  <p className="mt-3 text-slate-500">Loading customers...</p>
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <Users size={42} className="mx-auto text-slate-300" />

                  <p className="mt-3 font-medium text-slate-600">
                    No customers found
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Try changing your search or filters.
                  </p>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="transition hover:bg-slate-50">
                  {/* Customer */}

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                        {customer.fullName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {customer.fullName}
                        </p>

                        {isAdmin && customer.partner && (
                          <p className="text-xs text-slate-400">
                            {customer.partner.companyName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact */}

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone size={14} className="text-slate-400" />

                      {customer.phone || "—"}
                    </div>

                    {customer.email && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <Mail size={13} className="text-slate-400" />

                        {customer.email}
                      </div>
                    )}
                  </td>

                  {/* Address */}

                  <td className="max-w-[220px] px-4 py-4">
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={15}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <span className="truncate text-slate-600">
                        {customer.address || "—"}
                      </span>
                    </div>
                  </td>

                  {/* Shipments */}

                  <td className="px-4 py-4 text-center">
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                      {customer._count?.shipments || 0}
                    </span>
                  </td>

                  {/* Status */}

                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleStatus(customer)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        customer.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {customer.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* Created */}

                  <td className="px-4 py-4 text-slate-500">
                    {formatDate(customer.createdAt)}
                  </td>

                  {/* Actions */}

                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        title="View"
                        onClick={() => handleView(customer)}
                      >
                        <Eye size={17} />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        title="Edit"
                        onClick={() => handleEdit(customer)}
                      >
                        <Pencil size={17} />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        title="Delete"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDelete(customer)}
                      >
                        <Trash2 size={17} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================
          VIEW MODAL
      ====================================================== */}

      {viewOpen && viewCustomer && (
        <ModalShell onClose={() => setViewOpen(false)} title="Customer Details">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
                {viewCustomer.fullName.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="font-semibold text-slate-800">
                  {viewCustomer.fullName}
                </p>

                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    viewCustomer.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {viewCustomer.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <DetailRow label="Phone" value={viewCustomer.phone} />
              <DetailRow label="WhatsApp" value={viewCustomer.whatsapp} />
              <DetailRow label="Email" value={viewCustomer.email} />
              <DetailRow
                label="Shipments"
                value={String(viewCustomer._count?.shipments || 0)}
              />
              <DetailRow
                label="Created"
                value={formatDate(viewCustomer.createdAt)}
              />
              <DetailRow
                label="Updated"
                value={formatDate(viewCustomer.updatedAt)}
              />
              <DetailRow label="Address" value={viewCustomer.address} full />
              {isAdmin && viewCustomer.partner && (
                <DetailRow
                  label="Partner"
                  value={viewCustomer.partner.companyName}
                  full
                />
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </div>
        </ModalShell>
      )}

      {/* ======================================================
          EDIT MODAL
      ====================================================== */}

      {editOpen && selectedCustomer && (
        <ModalShell onClose={() => setEditOpen(false)} title="Edit Customer">
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <FormField label="Full Name *">
              <Input
                value={editForm.fullName}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                placeholder="Enter customer name"
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Phone">
                <Input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="01XXXXXXXXX"
                />
              </FormField>

              <FormField label="WhatsApp">
                <Input
                  value={editForm.whatsapp}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      whatsapp: e.target.value,
                    }))
                  }
                  placeholder="WhatsApp number"
                />
              </FormField>
            </div>

            <FormField label="Email">
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="customer@example.com"
              />
            </FormField>

            <FormField label="Address">
              <Input
                value={editForm.address}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="Customer address"
              />
            </FormField>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={editLoading}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={editLoading}>
                {editLoading && (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                )}
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* ======================================================
          STATUS TOGGLE MODAL
      ====================================================== */}

      {statusOpen && statusCustomer && (
        <ModalShell
          onClose={() => setStatusOpen(false)}
          title="Change Customer Status"
        >
          <p className="text-sm text-slate-600">
            Are you sure you want to mark{" "}
            <span className="font-semibold text-slate-800">
              {statusCustomer.fullName}
            </span>{" "}
            as{" "}
            <span
              className={
                statusCustomer.isActive
                  ? "font-semibold text-red-600"
                  : "font-semibold text-green-600"
              }
            >
              {statusCustomer.isActive ? "Inactive" : "Active"}
            </span>
            ?
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setStatusOpen(false)}
              disabled={statusLoading}
            >
              Cancel
            </Button>

            <Button onClick={confirmStatusChange} disabled={statusLoading}>
              {statusLoading && (
                <Loader2 size={16} className="mr-2 animate-spin" />
              )}
              {statusLoading ? "Updating..." : "Confirm"}
            </Button>
          </div>
        </ModalShell>
      )}

      {/* ======================================================
          DELETE MODAL
      ====================================================== */}

      {deleteOpen && deleteCustomer && (
        <ModalShell
          onClose={() => setDeleteOpen(false)}
          title="Delete Customer"
        >
          <p className="text-sm text-slate-600">
            This will permanently delete{" "}
            <span className="font-semibold text-slate-800">
              {deleteCustomer.fullName}
            </span>
            . This action cannot be undone.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>

            <Button
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteLoading && (
                <Loader2 size={16} className="mr-2 animate-spin" />
              )}
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="rounded-lg bg-blue-50 p-3 text-blue-600">{icon}</div>
      </div>
    </div>
  );
}

/* ============================================================
   MODAL SHELL — shared overlay + card used by all modals
============================================================ */

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ============================================================
   DETAIL ROW — used inside the View modal
============================================================ */

function DetailRow({
  label,
  value,
  full,
}: {
  label: string;
  value?: string | null;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 text-slate-700">{value || "—"}</p>
    </div>
  );
}

/* ============================================================
   FORM FIELD — used inside the Edit modal
============================================================ */

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      {children}
    </div>
  );
}
