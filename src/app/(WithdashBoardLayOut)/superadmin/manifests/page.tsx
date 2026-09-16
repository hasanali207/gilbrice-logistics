"use client";

import CreateManifestDialog from "@/components/manifest/CreateManifestDialog";
import ManifestStatusBadge from "@/components/manifest/ManifestStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Manifest, manifestApi } from "@/lib/manifest-api";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";
import { Eye, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

export default function ManifestsPage() {
  const [items, setItems] = useState<Manifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const user = useSelector((state: RootState) => state.auth.user);
  const basePath = getDashboardPath(user?.role);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setItems(await manifestApi.getAll());
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load manifests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id: string) => {
    if (!confirm("Delete this draft manifest?")) return;
    try {
      await manifestApi.delete(id);
      toast.success("Manifest deleted");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete manifest");
    }
  };

  const filtered = items.filter((m) =>
    [m.manifestCode, m.origin, m.destination, m.status, m.carrier?.name]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Operations</p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Master Manifests
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consolidate partner packages into a departure manifest.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <CreateManifestDialog onCreated={load} />
          </div>
        </div>

        <div className="rounded-xl border bg-background shadow-sm">
          <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">All Manifests</h2>
              <p className="text-xs text-muted-foreground">
                {items.length} manifest(s)
              </p>
            </div>
            <Input
              className="w-full md:max-w-xs"
              placeholder="Search manifest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Manifest</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Carrier</th>
                  <th className="px-4 py-3">Packages</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-10 text-center text-muted-foreground"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-10 text-center text-muted-foreground"
                    >
                      No manifests found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/20">
                      <td className="px-4 py-4 font-semibold">
                        {m.manifestCode}
                      </td>
                      <td className="px-4 py-4">
                        {m.origin} → {m.destination}
                      </td>
                      <td className="px-4 py-4">{m.mode}</td>
                      <td className="px-4 py-4">
                        <div>{m.carrier?.name ?? "—"}</div>
                        {m.waybillNumber && (
                          <div className="text-xs text-muted-foreground">
                            {m.waybillNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">{m._count?.packages ?? 0}</td>
                      <td className="px-4 py-4">
                        <ManifestStatusBadge status={m.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`${basePath}/manifests/${m.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Button>
                          </Link>
                          {m.status === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(m.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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
      </div>
    </div>
  );
}
