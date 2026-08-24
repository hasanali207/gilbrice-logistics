"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import {
  ArrowLeft,
  Edit,
  KeyRound,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type PartnerRole = "OWNER" | "MANAGER" | "WAREHOUSE_EMPLOYEE" | "CASHIER";

type StaffStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

interface Partner {
  id: string;
  companyName: string;
  trackingPrefix: string;
}

interface Employee {
  id: string;
  partnerId: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: PartnerRole;
  status: StaffStatus;
  createdAt: string;
  updatedAt: string;
}

const PartnerEmployeesPage = () => {
  const router = useRouter();
  const params = useParams();

  const partnerId = params.partnerId as string;
  const [partner, setPartner] = useState<Partner | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  // Edit modal
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "WAREHOUSE_EMPLOYEE" as PartnerRole,
  });

  // Password modal
  const [passwordEmployee, setPasswordEmployee] = useState<Employee | null>(
    null,
  );
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  /* ============================================================
     LOAD EMPLOYEES
  ============================================================ */

  const fetchEmployees = async () => {
    if (!partnerId) return;

    try {
      setRefreshing(true);

      const res = await api.get(`/api/v1/employee/${partnerId}/employees`);

      const responseData = res.data?.data;

      /**
       * Backend normally returns:
       * {
       *   success: true,
       *   data: [...]
       * }
       *
       * If your controller wraps partner information,
       * this also handles:
       * {
       *   data: {
       *     partner: {},
       *     employees: []
       *   }
       * }
       */

      if (Array.isArray(responseData)) {
        setEmployees(responseData);

        if (responseData.length > 0) {
          setPartner({
            id: partnerId,
            companyName: "Partner",
            trackingPrefix: "-",
          });
        }
      } else {
        setEmployees(responseData?.employees || []);

        if (responseData?.partner) {
          setPartner(responseData.partner);
        }
      }
    } catch (error: any) {
      console.error("Failed to load employees:", error);

      toast.error(error?.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (partnerId) {
      fetchEmployees();
    }
  }, [partnerId]);

  /* ============================================================
     SEARCH
  ============================================================ */

  const filteredEmployees = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return employees;

    return employees.filter((employee) => {
      return (
        employee.fullName.toLowerCase().includes(search) ||
        employee.email.toLowerCase().includes(search) ||
        employee.phone?.toLowerCase().includes(search) ||
        employee.role.toLowerCase().includes(search)
      );
    });
  }, [employees, searchTerm]);

  /* ============================================================
     EDIT
  ============================================================ */

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);

    setEditForm({
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone || "",
      role: employee.role,
    });
  };

  const handleEdit = async () => {
    if (!editingEmployee) return;

    if (!editForm.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!editForm.email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setEditLoading(true);

      await api.patch(
        `/api/v1/employee/${partnerId}/employees/${editingEmployee.id}`,
        {
          fullName: editForm.fullName.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim() || undefined,
          role: editForm.role,
        },
      );

      toast.success("Employee updated successfully");

      setEditingEmployee(null);

      await fetchEmployees();
    } catch (error: any) {
      console.error("Failed to update employee:", error);

      toast.error(
        error?.response?.data?.message || "Failed to update employee",
      );
    } finally {
      setEditLoading(false);
    }
  };

  /* ============================================================
     STATUS
  ============================================================ */

  const handleStatusChange = async (
    employee: Employee,
    status: StaffStatus,
  ) => {
    try {
      await api.patch(
        `/api/v1/employee/${partnerId}/employees/${employee.id}/status`,
        {
          status,
        },
      );

      toast.success(`Employee status changed to ${status}`);

      await fetchEmployees();
    } catch (error: any) {
      console.error("Failed to update status:", error);

      toast.error(
        error?.response?.data?.message || "Failed to update employee status",
      );
    }
  };

  /* ============================================================
     PASSWORD
  ============================================================ */

  const openPasswordModal = (employee: Employee) => {
    setPasswordEmployee(employee);
    setNewPassword("");
  };

  const handlePasswordChange = async () => {
    if (!passwordEmployee) return;

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setPasswordLoading(true);

      await api.patch(
        `/api/v1/employee/${partnerId}/employees/${passwordEmployee.id}/password`,
        {
          newPassword,
        },
      );

      toast.success("Password changed successfully");

      setPasswordEmployee(null);
      setNewPassword("");
    } catch (error: any) {
      console.error("Failed to change password:", error);

      toast.error(
        error?.response?.data?.message || "Failed to change password",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  /* ============================================================
     HELPERS
  ============================================================ */

  const getRoleLabel = (role: PartnerRole) => {
    switch (role) {
      case "OWNER":
        return "Owner";
      case "MANAGER":
        return "Manager";
      case "WAREHOUSE_EMPLOYEE":
        return "Warehouse Employee";
      case "CASHIER":
        return "Cashier";
      default:
        return role;
    }
  };

  const getStatusClass = (status: StaffStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "INACTIVE":
        return "bg-gray-100 text-gray-700";
      case "SUSPENDED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /* ============================================================
     LOADING
  ============================================================ */

  // if (loading) {
  //   return (
  //     <div className="max-w-7xl mx-auto py-10 px-4">
  //       <div className="flex items-center justify-center py-20 text-gray-500">
  //         <Loader2 className="animate-spin mr-2" size={20} />
  //         Loading employees...
  //       </div>
  //     </div>
  //   );
  // }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* BACK */}

      <button
        onClick={() => router.push("/superadmin/partners")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={16} />
        Back to Partners
      </button>

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {partner?.companyName || "Partner"} — Employees
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage partner employees, roles, status and passwords
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchEmployees}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin mr-2" : "mr-2"}
            />
            Refresh
          </Button>

          <Button
            onClick={() =>
              router.push(`/superadmin/partners/${partnerId}/employees/create`)
            }
          >
            Add Employee
          </Button>
        </div>
      </div>

      {/* SEARCH */}

      <div className="bg-white rounded-xl shadow border p-4 mb-6">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee..."
            className="pl-10"
          />
        </div>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow border p-5">
          <p className="text-sm text-gray-500">Total Employees</p>
          <p className="text-2xl font-bold mt-1">{employees.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow border p-5">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {employees.filter((e) => e.status === "ACTIVE").length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow border p-5">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">
            {employees.filter((e) => e.status === "INACTIVE").length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow border p-5">
          <p className="text-sm text-gray-500">Suspended</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {employees.filter((e) => e.status === "SUSPENDED").length}
          </p>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Employee List</h2>

          <p className="text-sm text-gray-500 mt-1">
            {filteredEmployees.length} employee
            {filteredEmployees.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-secondary text-white">
              <tr>
                <th className="border p-3 text-left">Employee</th>
                <th className="border p-3 text-left">Email</th>
                <th className="border p-3 text-left">Phone</th>
                <th className="border p-3 text-left">Role</th>
                <th className="border p-3 text-left">Status</th>
                <th className="border p-3 text-left">Created</th>
                <th className="border p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b hover:bg-gray-50">
                  <td className="border p-3">
                    <div className="font-medium text-gray-800">
                      {employee.fullName}
                    </div>

                    <div className="text-xs text-gray-400 font-mono mt-1">
                      {employee.id.slice(0, 8)}...
                    </div>
                  </td>

                  <td className="border p-3">{employee.email}</td>

                  <td className="border p-3">{employee.phone || "—"}</td>

                  <td className="border p-3">
                    <span className="inline-flex px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                      {getRoleLabel(employee.role)}
                    </span>
                  </td>

                  <td className="border p-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                        employee.status,
                      )}`}
                    >
                      {employee.status}
                    </span>
                  </td>

                  <td className="border p-3 whitespace-nowrap">
                    {new Date(employee.createdAt).toLocaleDateString("en-BD")}
                  </td>

                  <td className="border p-3">
                    <div className="flex items-center justify-center gap-2">
                      {/* EDIT */}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(employee)}
                        title="Edit"
                      >
                        <Edit size={15} />
                      </Button>

                      {/* PASSWORD */}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPasswordModal(employee)}
                        title="Change Password"
                      >
                        <KeyRound size={15} />
                      </Button>

                      {/* STATUS */}

                      {employee.status === "ACTIVE" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleStatusChange(employee, "INACTIVE")
                          }
                          title="Deactivate"
                        >
                          <UserX size={15} />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(employee, "ACTIVE")}
                          title="Activate"
                        >
                          <UserCheck size={15} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          EDIT MODAL
      ======================================================== */}

      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold">Edit Employee</h2>

                <p className="text-sm text-gray-500 mt-1">
                  Update employee information
                </p>
              </div>

              <button
                onClick={() => setEditingEmployee(null)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>

                <Input
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>

                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>

                <Input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Role</label>

                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      role: e.target.value as PartnerRole,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                >
                  <option value="OWNER">Owner</option>
                  <option value="MANAGER">Manager</option>
                  <option value="WAREHOUSE_EMPLOYEE">Warehouse Employee</option>
                  <option value="CASHIER">Cashier</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingEmployee(null)}
                disabled={editLoading}
              >
                Cancel
              </Button>

              <Button onClick={handleEdit} disabled={editLoading}>
                {editLoading ? "Updating..." : "Update Employee"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PASSWORD MODAL
      ======================================================== */}

      {passwordEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold">Change Password</h2>

                <p className="text-sm text-gray-500 mt-1">
                  {passwordEmployee.fullName}
                </p>
              </div>

              <button
                onClick={() => setPasswordEmployee(null)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div>
              <label className="text-sm font-medium">New Password</label>

              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />

              <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPasswordEmployee(null)}
                disabled={passwordLoading}
              >
                Cancel
              </Button>

              <Button onClick={handlePasswordChange} disabled={passwordLoading}>
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerEmployeesPage;
