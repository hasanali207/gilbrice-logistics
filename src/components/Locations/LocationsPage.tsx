"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/* ============================================================
   TYPES
============================================================ */

type LocationType = "AIRPORT" | "SEAPORT" | "CITY" | "WAREHOUSE";

interface ILocation {
  id: string;
  name: string;
  code: string;
  country: string;
  type: LocationType;
  isActive: boolean;
}

interface LocationForm {
  name: string;
  code: string;
  country: string;
  type: LocationType;
}

/* ============================================================
   EMPTY FORM
============================================================ */

const emptyForm: LocationForm = {
  name: "",
  code: "",
  country: "",
  type: "AIRPORT",
};

/* ============================================================
   COMPONENT
============================================================ */

const LocationsPage = () => {
  const [locations, setLocations] = useState<ILocation[]>([]);

  const [loading, setLoading] = useState(true);

  const [adding, setAdding] = useState(false);

  const [form, setForm] = useState<LocationForm>(emptyForm);

  const [error, setError] = useState<string | null>(null);

  /* ==========================================================
     UPDATE MODAL STATE
  ========================================================== */

  const [editOpen, setEditOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<LocationForm>(emptyForm);

  const [editError, setEditError] = useState<string | null>(null);

  const [updating, setUpdating] = useState(false);

  /* ==========================================================
     LOAD LOCATIONS
  ========================================================== */

  const loadLocations = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/v1/locations");

      setLocations(res.data?.data ?? []);
    } catch (err: any) {
      console.error("Failed to load locations:", err);

      toast.error(err?.response?.data?.message || "Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  /* ==========================================================
     ADD LOCATION
  ========================================================== */

  const handleAddLocation = async () => {
    setError(null);

    if (!form.name || !form.code || !form.country) {
      setError("Name, code, and country are required");
      return;
    }

    try {
      setAdding(true);

      const res = await api.post("/api/v1/locations", form);

      const newLocation = res.data?.data;

      if (newLocation) {
        setLocations((prev) => [newLocation, ...prev]);
      }

      setForm(emptyForm);

      toast.success("Location added successfully");
    } catch (err: any) {
      console.error("Failed to add location:", err);

      const message = err?.response?.data?.message || "Failed to add location";

      setError(message);

      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  /* ==========================================================
     OPEN UPDATE MODAL
  ========================================================== */

  const openEditModal = (loc: ILocation) => {
    setEditingId(loc.id);

    setEditForm({
      name: loc.name,
      code: loc.code,
      country: loc.country,
      type: loc.type,
    });

    setEditError(null);

    setEditOpen(true);
  };

  /* ==========================================================
     UPDATE LOCATION
  ========================================================== */

  const handleUpdateLocation = async () => {
    if (!editingId) return;

    setEditError(null);

    if (!editForm.name || !editForm.code || !editForm.country) {
      setEditError("Name, code, and country are required");
      return;
    }

    try {
      setUpdating(true);

      const res = await api.patch(`/api/v1/locations/${editingId}`, editForm);

      const updated = res.data?.data;

      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === editingId ? { ...loc, ...(updated ?? editForm) } : loc,
        ),
      );

      setEditOpen(false);

      toast.success("Location updated successfully");
    } catch (err: any) {
      console.error("Failed to update location:", err);

      const message =
        err?.response?.data?.message || "Failed to update location";

      setEditError(message);

      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  /* ==========================================================
     DELETE (DEACTIVATE) LOCATION
  ========================================================== */

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/v1/locations/${id}`);

      setLocations((prev) =>
        prev.map((loc) => (loc.id === id ? { ...loc, isActive: false } : loc)),
      );

      toast.success("Location deactivated");
    } catch (err: any) {
      console.error("Failed to delete location:", err);

      toast.error(err?.response?.data?.message || "Failed to delete location");
    }
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Locations</h2>

      {/* ======================================================
          ADD LOCATION FORM
      ====================================================== */}

      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h3 className="text-lg font-semibold mb-5">Add a Location</h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Name</label>

            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Columbus"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Code</label>

            <Input
              value={form.code}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))
              }
              placeholder="CMH"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Country</label>

            <Input
              value={form.country}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, country: e.target.value }))
              }
              placeholder="United States"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Type</label>

            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  type: e.target.value as LocationType,
                }))
              }
            >
              <option value="AIRPORT">Airport</option>
              <option value="SEAPORT">Seaport</option>
              <option value="CITY">City</option>
              <option value="WAREHOUSE">Warehouse</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <Button onClick={handleAddLocation} disabled={adding}>
            {adding ? "Adding..." : "Add Location"}
          </Button>
        </div>
      </div>

      {/* ======================================================
          LOCATIONS LIST
      ====================================================== */}

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">All Locations</h3>

          <span className="text-sm text-gray-500">
            {locations.length} location{locations.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400">
            Loading locations...
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-400">No locations added yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-secondary text-white">
                <tr>
                  <th className="border p-3 text-left">Code</th>
                  <th className="border p-3 text-left">Name</th>
                  <th className="border p-3 text-left">Country</th>
                  <th className="border p-3 text-left">Type</th>
                  <th className="border p-3 text-center">Status</th>
                  <th className="border p-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id} className="odd:bg-gray-50 hover:bg-gray-100">
                    <td className="border p-3 font-mono">{loc.code}</td>
                    <td className="border p-3">{loc.name}</td>
                    <td className="border p-3">{loc.country}</td>
                    <td className="border p-3">{loc.type}</td>
                    <td className="border p-3 text-center">
                      <span
                        className={
                          loc.isActive
                            ? "inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                            : "inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500"
                        }
                      >
                        {loc.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="border p-3 text-center space-x-3">
                      <Button
                        onClick={() => openEditModal(loc)}
                        variant="link"
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Edit
                      </Button>

                      {loc.isActive && (
                        <Button
                          onClick={() => handleDelete(loc.id)}
                          variant="default"
                          className=" text-sm hover:underline"
                        >
                          <Trash2Icon className="w-4 h-4 inline-block mr-1" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================
          UPDATE LOCATION MODAL
      ====================================================== */}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Location</DialogTitle>
          </DialogHeader>

          {editError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {editError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Name</label>

              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Columbus"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Code</label>

              <Input
                value={editForm.code}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="CMH"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Country
              </label>

              <Input
                value={editForm.country}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    country: e.target.value,
                  }))
                }
                placeholder="United States"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Type</label>

              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={editForm.type}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    type: e.target.value as LocationType,
                  }))
                }
              >
                <option value="AIRPORT">Airport</option>
                <option value="SEAPORT">Seaport</option>
                <option value="CITY">City</option>
                <option value="WAREHOUSE">Warehouse</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>

            <Button onClick={handleUpdateLocation} disabled={updating}>
              {updating ? "Updating..." : "Update Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationsPage;
