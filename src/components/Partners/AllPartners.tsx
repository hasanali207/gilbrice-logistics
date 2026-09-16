"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";
import { getPagination } from "@/utils/getPageNumber";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CreditCard,
  DollarSign,
  History,
  Plus,
  Scan,
  Ship,
  SquarePen,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import ActionDropdown from "../ui/ActionDropdown";

/* ================= TYPES ================= */
interface IPartner {
  id: string;
  companyName: string;
  slug: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  trackingPrefix: string;
  isActive: boolean;
  creditLimit?: number | string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    customers: number;
    shipments: number;
    employees: number;
    wholesaleRates: number;
  };
}

const emptyEditForm = {
  companyName: "",
  slug: "",
  trackingPrefix: "",
  phone: "",
  email: "",
  address: "",
  logoUrl: "",
  creditLimit: "" as string | number,
  isActive: true,
};

/* ================= MAIN COMPONENT ================= */
const AllPartners = forwardRef((props, ref) => {
  const [partners, setPartners] = useState<IPartner[]>([]);
  const [loading, setLoading] = useState(false);

  /* filters */
  const [searchTerm, setSearchTerm] = useState("");
  const [prefixFilter, setPrefixFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  /* pagination */
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  /* edit modal */
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<IPartner | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  /* status toggle */
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const basePath = getDashboardPath(user?.role);

  /* ================= FETCH ================= */
  const fetchAllPartners = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));

      if (searchTerm.trim()) {
        params.set("searchTerm", searchTerm.trim());
      }

      if (prefixFilter.trim()) {
        params.set("trackingPrefix", prefixFilter.trim());
      }

      if (statusFilter !== "ALL") {
        params.set("isActive", statusFilter === "ACTIVE" ? "true" : "false");
      }

      const res = await api.get(`/api/v1/partner?${params.toString()}`);

      const { data, meta } = res.data;

      setPartners(data || []);
      setTotalPages(meta?.total ? Math.ceil(meta.total / meta.limit) : 1);
    } catch (err) {
      console.error("Fetch all partners error:", err);
      toast.error("Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    reload: fetchAllPartners,
  }));

  useEffect(() => {
    fetchAllPartners();
  }, [page, searchTerm, prefixFilter, statusFilter]);
  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  /* ================= EDIT ================= */
  const handleEdit = (partner: IPartner) => {
    setSelectedPartner(partner);
    setEditForm({
      companyName: partner.companyName,
      slug: partner.slug,
      trackingPrefix: partner.trackingPrefix,
      phone: partner.phone || "",
      email: partner.email || "",
      address: partner.address || "",
      logoUrl: partner.logoUrl || "",
      creditLimit: partner.creditLimit ?? "",
      isActive: partner.isActive,
    });
    setEditError(null);
    setEditOpen(true);
  };

  const cancelEdit = () => {
    setEditOpen(false);
    setSelectedPartner(null);
    setEditError(null);
  };

  const handleUpdate = async () => {
    if (!selectedPartner) return;
    if (
      !editForm.companyName.trim() ||
      !editForm.slug.trim() ||
      !editForm.trackingPrefix.trim()
    ) {
      setEditError("Company name, slug, and tracking prefix are required");
      return;
    }

    setUpdating(true);
    setEditError(null);
    try {
      const payload = {
        companyName: editForm.companyName.trim(),
        slug: editForm.slug.trim(),
        trackingPrefix: editForm.trackingPrefix.trim().toUpperCase(),
        phone: editForm.phone.trim() || undefined,
        email: editForm.email.trim() || undefined,
        address: editForm.address.trim() || undefined,
        logoUrl: editForm.logoUrl.trim() || undefined,
      };
      await api.patch(`/api/v1/partner/${selectedPartner.id}`, payload);
      toast.success("Partner updated successfully");
      cancelEdit();
      fetchAllPartners();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Update failed";
      setEditError(message);
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  /* ================= STATUS TOGGLE ================= */
  const handleToggleStatus = async (partner: IPartner) => {
    const goingInactive = partner.isActive;
    const result = await Swal.fire({
      title: "Are you sure?",
      text: goingInactive
        ? `${partner.companyName} will be marked inactive.`
        : `${partner.companyName} will be marked active again.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: goingInactive ? "Yes, deactivate" : "Yes, activate",
    });

    if (!result.isConfirmed) return;

    setTogglingId(partner.id);
    try {
      await api.patch(`/api/v1/partner/${partner.id}/status`, {
        isActive: !partner.isActive,
      });
      toast.success(
        goingInactive ? "Partner deactivated" : "Partner activated",
      );
      fetchAllPartners();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Status change failed");
    } finally {
      setTogglingId(null);
    }
  };

  /* action items shown inside the dropdown (Edit stays outside) */
  const getMenuActions = (p: IPartner) => [
    {
      href: `${basePath}/partners/${p.id}/rates`,
      label: "Wholesale Rates",
      icon: Ship,
    },
    {
      href: `${basePath}/partners/${p.id}/ledger`,
      label: "Ledger",
      icon: BookOpen,
    },
    {
      href: `${basePath}/partners/${p.id}/employees`,
      label: "Employees",
      icon: Users,
    },
    {
      href: `${basePath}/partners/${p.id}/scanner`,
      label: "Scanner",
      icon: Scan,
    },
    {
      href: `${basePath}/partners/${p.id}/scanhistory`,
      label: "Scan History",
      icon: History,
    },
    {
      href: `${basePath}/partners/${p.id}/settlement`,
      label: "Settlement",
      icon: DollarSign,
    },
    {
      href: `${basePath}/partners/${p.id}/ledger`,
      label: "Credit / Ledger",
      icon: CreditCard,
    },
  ];

  const pages = getPagination(page, totalPages);
  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Partners</h2>
        <Link href={`${basePath}/partners/create`}>
          <Button>
            <Plus size={16} /> New Partner
          </Button>
        </Link>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <Input
          placeholder="Search Company Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Input
          placeholder="Tracking Prefix"
          value={prefixFilter}
          onChange={(e) => setPrefixFilter(e.target.value)}
        />
        <select
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")
          }
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm min-w-[800px]">
          <thead className="bg-secondary text-white">
            <tr className="border border-slate-600">
              {[
                "SL",
                "Company",
                "Slug",
                "Prefix",
                "Phone",
                "Email",
                "Status",
                "Rates",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-100 border border-slate-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-6 text-gray-500 border border-gray-200"
                >
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              partners.map((p, idx) => (
                <tr
                  key={p.id}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-blue-50"
                  } hover:bg-blue-100/70 transition-colors`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800 border border-gray-200">
                    {idx + 1 + (page - 1) * limit}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 border border-gray-200">
                    {p.companyName}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 border border-gray-200">
                    {p.slug}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 border border-gray-200">
                    {p.trackingPrefix}
                  </td>
                  <td className="px-4 py-3 text-gray-600 border border-gray-200">
                    {p.phone || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 border border-gray-200">
                    {p.email || "-"}
                  </td>
                  <td className="px-4 py-3 border border-gray-200">
                    <button
                      onClick={() => handleToggleStatus(p)}
                      disabled={togglingId === p.id}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer disabled:opacity-50 transition-colors ${
                        p.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      {togglingId === p.id
                        ? "..."
                        : p.isActive
                          ? "Active"
                          : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600 border border-gray-200">
                    {p._count?.wholesaleRates
                      ? `${p._count.wholesaleRates} rate(s)`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        title="Edit partner"
                        onClick={() => handleEdit(p)}
                      >
                        <SquarePen size={14} className="mr-1" />
                        Edit
                      </Button>

                      {/* kebab / hamburger menu for the rest */}
                      <ActionDropdown items={getMenuActions(p)} />
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && partners.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-6 text-gray-500 border border-gray-200"
                >
                  No partners found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ArrowLeft /> Prev
            </button>

            <div className="flex items-center gap-1">
              {pages.map((item: any, index: any) =>
                item === "..." ? (
                  <span
                    key={`dots-${index}`}
                    className="w-9 h-9 flex items-center justify-center text-gray-500"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => changePage(item as number)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      page === item
                        ? "bg-green-600 text-white shadow-sm"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Next <ArrowRight />
            </button>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editOpen && selectedPartner && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={cancelEdit}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Update Partner</h3>
            {editError && (
              <div className="text-red-600 mb-3 text-sm">{editError}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Company Name *"
                value={editForm.companyName}
                onChange={(e) =>
                  setEditForm({ ...editForm, companyName: e.target.value })
                }
              />
              <Input
                placeholder="Slug *"
                value={editForm.slug}
                onChange={(e) =>
                  setEditForm({ ...editForm, slug: e.target.value })
                }
              />
              <Input
                placeholder="Tracking Prefix *"
                value={editForm.trackingPrefix}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    trackingPrefix: e.target.value.toUpperCase(),
                  })
                }
              />
              <Input
                placeholder="Credit Limit"
                type="number"
                value={editForm.creditLimit}
                disabled
                title="Credit limit isn't part of the update endpoint — change it directly if the backend adds support."
              />
              <Input
                placeholder="Phone"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
              <Input
                placeholder="Address"
                className="md:col-span-2"
                value={editForm.address}
                onChange={(e) =>
                  setEditForm({ ...editForm, address: e.target.value })
                }
              />
              <Input
                placeholder="Logo URL"
                className="md:col-span-2"
                value={editForm.logoUrl}
                onChange={(e) =>
                  setEditForm({ ...editForm, logoUrl: e.target.value })
                }
              />
            </div>

            <p className="text-xs text-gray-400 mt-3">
              To change Active/Inactive status, click the Status badge in the
              table.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updating}>
                {updating ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AllPartners.displayName = "AllPartners";
export default AllPartners;
