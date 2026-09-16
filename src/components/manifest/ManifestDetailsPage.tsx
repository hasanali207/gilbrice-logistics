"use client";

import CarrierDialog from "@/components/manifest/CarrierDialog";
import ManifestStatusBadge from "@/components/manifest/ManifestStatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Manifest, ManifestShipment, manifestApi } from "@/lib/manifest-api";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Package as PackageIcon,
  Plane,
  Plus,
  RefreshCw,
  Search,
  Ship,
  Truck,
  XCircle,
} from "lucide-react";

import Link from "next/link";
import { useParams } from "next/navigation";
import { KeyboardEvent, useCallback, useEffect, useState } from "react";

import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

// ============================================================
// TYPES
// ============================================================

type ManifestPackageItem = {
  id: string;
  packageId: string;
  partner?: {
    companyName?: string | null;
  } | null;
  package: {
    id: string;
    packageCode: string;
    packageNumber?: number;
    description?: string | null;
    weightKg: number | string;
    status: string;
    shipment?: {
      trackingNumber?: string | null;
      customer?: {
        fullName?: string | null;
      } | null;
    } | null;
  };
};

type ExtendedManifest = Manifest & {
  originId?: string | null;
  destinationId?: string | null;
  packages?: ManifestPackageItem[];
};

type ShipmentPackagePreview = {
  id: string;
  packageCode: string;
  packageNumber?: number;
  description?: string | null;
  weightKg: number | string;
  status: string;
  manifestPackages?: Array<{
    id: string;
    manifestId?: string;
  }>;
};

type ExtendedManifestShipment = ManifestShipment & {
  originId?: string | null;
  destinationId?: string | null;
  origin?: string | null;
  destination?: string | null;
  mode: string;
  status: string;
  trackingNumber: string;
  totalPackages?: number;
  customer?: {
    fullName?: string | null;
  } | null;
  partner?: {
    companyName?: string | null;
  } | null;
  packages: ShipmentPackagePreview[];
};

// ============================================================
// HELPERS
// ============================================================

const moneyOrNumber = (value: unknown) => {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return "0.000";
  }

  return number.toFixed(3);
};

const normalizeText = (value?: string | null) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const isSameLocation = (
  shipmentId?: string | null,
  shipmentName?: string | null,
  manifestId?: string | null,
  manifestName?: string | null,
) => {
  if (shipmentId && manifestId) {
    return shipmentId === manifestId;
  }

  if (shipmentName && manifestName) {
    return normalizeText(shipmentName) === normalizeText(manifestName);
  }

  return false;
};

// ============================================================
// ADD PACKAGES DIALOG
// ============================================================

function AddPackagesDialog({
  manifest,
  disabled,
  onAdded,
}: {
  manifest: ExtendedManifest;
  disabled?: boolean;
  onAdded: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);

  const [tab, setTab] = useState<"shipment" | "package">("shipment");

  const [code, setCode] = useState("");

  const [shipment, setShipment] = useState<ExtendedManifestShipment | null>(
    null,
  );

  const [searching, setSearching] = useState(false);

  const [adding, setAdding] = useState(false);

  // ==========================================================
  // RESET
  // ==========================================================

  const reset = () => {
    if (searching || adding) return;

    setCode("");
    setShipment(null);
    setTab("shipment");
    setOpen(false);
  };

  // ==========================================================
  // CHANGE TAB
  // ==========================================================

  const changeTab = (nextTab: "shipment" | "package") => {
    if (searching || adding) return;

    setTab(nextTab);
    setCode("");
    setShipment(null);
  };

  // ==========================================================
  // SEARCH SHIPMENT
  // ==========================================================

  const searchShipment = async () => {
    const trackingNumber = code.trim();

    if (!trackingNumber) {
      toast.error("Shipment tracking number is required.");
      return;
    }

    try {
      setSearching(true);
      setShipment(null);

      const result = await manifestApi.getShipmentForManifest(trackingNumber);

      setShipment(result as ExtendedManifestShipment);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to find shipment.");
    } finally {
      setSearching(false);
    }
  };

  // ==========================================================
  // SHIPMENT VALIDATION
  // ==========================================================

  const validateShipmentForManifest = (
    targetShipment: ExtendedManifestShipment,
  ) => {
    if (!targetShipment) {
      return "Find a shipment first.";
    }

    if (targetShipment.status !== "WEIGHED") {
      return "Shipment must be WEIGHED before it can be added to a manifest.";
    }

    if (targetShipment.mode !== manifest.mode) {
      return `Shipment mode ${targetShipment.mode} does not match manifest mode ${manifest.mode}.`;
    }

    const sameOrigin = isSameLocation(
      targetShipment.originId,
      targetShipment.origin,
      manifest.originId,
      manifest.origin,
    );

    if (!sameOrigin) {
      return "Shipment origin does not match the manifest origin.";
    }

    const sameDestination = isSameLocation(
      targetShipment.destinationId,
      targetShipment.destination,
      manifest.destinationId,
      manifest.destination,
    );

    if (!sameDestination) {
      return "Shipment destination does not match the manifest destination.";
    }

    if (!targetShipment.packages?.length) {
      return "Shipment has no packages.";
    }

    const invalidPackages = targetShipment.packages.filter(
      (pkg) => pkg.status !== "WEIGHED",
    );

    if (invalidPackages.length > 0) {
      return "All shipment packages must be WEIGHED before adding the shipment.";
    }

    const alreadyAddedPackages = targetShipment.packages.filter(
      (pkg) => (pkg.manifestPackages?.length ?? 0) > 0,
    );

    if (alreadyAddedPackages.length > 0) {
      return "One or more packages from this shipment are already assigned to a manifest.";
    }

    return null;
  };

  // ==========================================================
  // ADD ENTIRE SHIPMENT
  // ==========================================================

  const addShipment = async () => {
    if (!shipment) {
      toast.error("Find a shipment first.");
      return;
    }

    const validationError = validateShipmentForManifest(shipment);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setAdding(true);

      await manifestApi.addShipment(manifest.id, shipment.trackingNumber);

      toast.success(`${shipment.packages.length} packages added successfully.`);

      setCode("");
      setShipment(null);
      setOpen(false);

      await onAdded();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add shipment.");
    } finally {
      setAdding(false);
    }
  };

  // ==========================================================
  // ADD INDIVIDUAL PACKAGE
  // ==========================================================

  const addIndividualPackage = async () => {
    const packageCode = code.trim();

    if (!packageCode) {
      toast.error("Package code is required.");
      return;
    }

    try {
      setAdding(true);

      await manifestApi.addPackage(manifest.id, packageCode);

      toast.success("Package added to manifest.");

      setCode("");
      setShipment(null);
      setOpen(false);

      await onAdded();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add package.");
    } finally {
      setAdding(false);
    }
  };

  // ==========================================================
  // ENTER KEY
  // ==========================================================

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    if (tab === "shipment") {
      if (!shipment) {
        void searchShipment();
      } else {
        void addShipment();
      }
    } else {
      void addIndividualPackage();
    }
  };

  // ==========================================================
  // OPEN
  // ==========================================================

  const openDialog = () => {
    if (disabled) return;

    setCode("");
    setShipment(null);
    setTab("shipment");
    setOpen(true);
  };

  const shipmentValidationError = shipment
    ? validateShipmentForManifest(shipment)
    : null;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <Button disabled={disabled} onClick={openDialog}>
        <Plus className="mr-2 h-4 w-4" />
        Add Packages
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              reset();
            }
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="border-b p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold">
                    Add Packages to Manifest
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Add an entire shipment or an individual package.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={reset}
                  disabled={searching || adding}
                  className="shrink-0 text-2xl leading-none text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* =================================================
                  TABS
              ================================================= */}

              <div className="mt-5 grid grid-cols-2 rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => changeTab("shipment")}
                  disabled={searching || adding}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    tab === "shipment"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Shipment
                </button>

                <button
                  type="button"
                  onClick={() => changeTab("package")}
                  disabled={searching || adding}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    tab === "package"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Individual Package
                </button>
              </div>
            </div>

            {/* =================================================
                BODY
            ================================================= */}

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {/* =================================================
                  SHIPMENT TAB
              ================================================= */}

              {tab === "shipment" && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Shipment Tracking Number
                    </label>

                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={code}
                        onChange={(event) => {
                          setCode(event.target.value);
                          setShipment(null);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Scan or enter shipment code"
                        disabled={searching || adding}
                        className="h-11 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={searchShipment}
                        disabled={searching || adding || !code.trim()}
                      >
                        {searching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Scan the shipment barcode or type the tracking number and
                      press Enter.
                    </p>
                  </div>

                  {/* =================================================
                      MANIFEST INFO
                  ================================================= */}

                  <div className="rounded-lg border bg-muted/20 p-3">
                    <div className="grid gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Manifest
                        </p>

                        <p className="mt-1 font-medium">
                          {manifest.manifestCode}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Route</p>

                        <p className="mt-1 font-medium">
                          {manifest.origin} → {manifest.destination}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Mode</p>

                        <p className="mt-1 font-medium">{manifest.mode}</p>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      SHIPMENT PREVIEW
                  ================================================= */}

                  {shipment && (
                    <div className="space-y-4">
                      <div className="rounded-xl border bg-muted/30 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="break-all text-lg font-semibold">
                              {shipment.trackingNumber}
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {shipment.customer?.fullName || "No customer"}
                            </p>
                          </div>

                          <span className="w-fit shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                            {shipment.status}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Route
                            </p>

                            <p className="text-sm font-medium">
                              {shipment.origin || "—"} →{" "}
                              {shipment.destination || "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Mode
                            </p>

                            <p className="text-sm font-medium">
                              {shipment.mode}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Partner
                            </p>

                            <p className="text-sm font-medium">
                              {shipment.partner?.companyName || "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Packages
                            </p>

                            <p className="text-sm font-medium">
                              {shipment.packages?.length ??
                                shipment.totalPackages ??
                                0}{" "}
                              packages
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* =================================================
                          PACKAGE LIST
                      ================================================= */}

                      <div className="rounded-xl border">
                        <div className="flex items-center justify-between gap-4 border-b p-4">
                          <div>
                            <p className="font-semibold">Shipment Packages</p>

                            <p className="text-xs text-muted-foreground">
                              All packages will be added together.
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs">
                            {shipment.packages.length} pieces
                          </span>
                        </div>

                        <div className="divide-y">
                          {shipment.packages.map((pkg) => {
                            const alreadyAdded =
                              (pkg.manifestPackages?.length ?? 0) > 0;

                            return (
                              <div
                                key={pkg.id}
                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="min-w-0">
                                  <p className="break-all font-medium">
                                    {pkg.packageCode}
                                  </p>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {pkg.status} · {moneyOrNumber(pkg.weightKg)}{" "}
                                    kg
                                  </p>

                                  {pkg.description && (
                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                      {pkg.description}
                                    </p>
                                  )}
                                </div>

                                {alreadyAdded ? (
                                  <span className="w-fit shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                                    Already added
                                  </span>
                                ) : (
                                  <span
                                    className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                                      pkg.status === "WEIGHED"
                                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                        : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                    }`}
                                  >
                                    {pkg.status}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* =================================================
                          VALIDATION
                      ================================================= */}

                      {shipmentValidationError && (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                          {shipmentValidationError}
                        </div>
                      )}

                      {!shipmentValidationError && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
                          Shipment is ready to be added to this manifest.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* =================================================
                  PACKAGE TAB
              ================================================= */}

              {tab === "package" && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Package Code
                    </label>

                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Scan or enter package code"
                        disabled={adding}
                        className="h-11 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />

                      <Button
                        type="button"
                        onClick={addIndividualPackage}
                        disabled={adding || !code.trim()}
                      >
                        {adding ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Use this option when you want to add only one package.
                    </p>
                  </div>

                  <div className="rounded-lg border bg-muted/20 p-4">
                    <p className="text-sm font-medium">Package scanning</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Scan a package code such as{" "}
                      <span className="font-medium text-foreground">
                        G&amp;L GRP-260910-00001-P1
                      </span>{" "}
                      or type it manually.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="flex flex-col-reverse gap-2 border-t p-5 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={reset}
                disabled={searching || adding}
              >
                Cancel
              </Button>

              {tab === "shipment" && (
                <Button
                  onClick={addShipment}
                  disabled={!shipment || adding || !!shipmentValidationError}
                >
                  {adding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Packages...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add All {shipment?.packages.length || ""} Packages
                    </>
                  )}
                </Button>
              )}

              {tab === "package" && (
                <Button
                  onClick={addIndividualPackage}
                  disabled={adding || !code.trim()}
                >
                  {adding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Package
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// MANIFEST DETAILS PAGE
// ============================================================

export default function ManifestDetailsPage() {
  const params = useParams<{ id: string }>();

  const id = params.id;

  const [manifest, setManifest] = useState<ExtendedManifest | null>(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);

  const basePath = getDashboardPath(user?.role);

  // ==========================================================
  // LOAD MANIFEST
  // ==========================================================

  const load = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      const data = await manifestApi.getById(id);

      setManifest(data as ExtendedManifest);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load manifest.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      void load();
    }
  }, [id, load]);

  // ==========================================================
  // ACTION RUNNER
  // ==========================================================

  const run = async (fn: () => Promise<any>, successMessage: string) => {
    if (actionLoading) return;

    try {
      setActionLoading(true);

      await fn();

      toast.success(successMessage);

      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // REMOVE PACKAGE
  // ==========================================================

  const handleRemovePackage = async (
    packageId: string,
    packageCode: string,
  ) => {
    if (actionLoading) return;

    const confirmed = window.confirm(
      `Remove ${packageCode} from this manifest?`,
    );

    if (!confirmed) return;

    await run(
      () => manifestApi.removePackage(id, packageId),
      "Package removed from manifest.",
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading && !manifest) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading manifest...
        </div>
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND
  // ==========================================================

  if (!manifest) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <PackageIcon className="mb-3 h-10 w-10 text-muted-foreground" />

        <h2 className="text-lg font-semibold">Manifest not found</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          The requested manifest could not be loaded.
        </p>

        <Button asChild variant="outline" className="mt-5">
          <Link href={`${basePath}/manifests`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to manifests
          </Link>
        </Button>
      </div>
    );
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const draft = manifest.status === "DRAFT";

  const packages = (manifest.packages as ManifestPackageItem[]) ?? [];

  const totalWeight = packages.reduce(
    (sum, item) => sum + Number(item.package?.weightKg ?? 0),
    0,
  );

  const uniqueShipmentIds = new Set<string>();

  for (const item of packages) {
    const trackingNumber = item.package?.shipment?.trackingNumber;

    if (trackingNumber) {
      uniqueShipmentIds.add(trackingNumber);
    }
  }

  const uniqueShipments = uniqueShipmentIds.size;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-3">
            <Link
              href={`${basePath}/manifests`}
              className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to manifests
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-all text-2xl font-bold md:text-3xl">
                {manifest.manifestCode}
              </h1>

              <ManifestStatusBadge status={manifest.status} />
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>
                  {manifest.origin} → {manifest.destination}
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5">
                {manifest.mode === "AIR" ? (
                  <Plane className="h-4 w-4 shrink-0" />
                ) : (
                  <Ship className="h-4 w-4 shrink-0" />
                )}

                {manifest.mode}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <PackageIcon className="h-4 w-4 shrink-0" />
                {packages.length} packages
              </span>

              <span>{uniqueShipments} shipments</span>

              <span>{moneyOrNumber(totalWeight)} kg total</span>
            </div>
          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button
              variant="outline"
              onClick={() => void load()}
              disabled={loading || actionLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <AddPackagesDialog
              manifest={manifest}
              disabled={!draft || actionLoading}
              onAdded={load}
            />

            <CarrierDialog
              manifestId={id}
              currentCarrier={manifest.carrier}
              currentWaybill={manifest.waybillNumber}
              disabled={!draft || actionLoading}
              onSaved={load}
            />

            {draft && (
              <Button
                disabled={actionLoading}
                onClick={() =>
                  run(() => manifestApi.finalize(id), "Manifest finalized.")
                }
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Finalize
              </Button>
            )}

            {manifest.status === "FINALIZED" && (
              <Button
                disabled={actionLoading}
                onClick={() =>
                  run(() => manifestApi.depart(id), "Manifest departed.")
                }
              >
                <Truck className="mr-2 h-4 w-4" />
                Depart
              </Button>
            )}

            {manifest.status === "DEPARTED" && (
              <Button
                disabled={actionLoading}
                onClick={() =>
                  run(() => manifestApi.arrive(id), "Manifest marked arrived.")
                }
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Arrive
              </Button>
            )}
          </div>
        </div>

        {/* ====================================================
            STATUS NOTICE
        ==================================================== */}

        {!draft && (
          <div className="rounded-xl border bg-background p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

              <div>
                <p className="text-sm font-semibold">
                  Manifest is {manifest.status}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Package additions, removals and carrier changes are available
                  only while the manifest is in DRAFT.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-background p-5 shadow-sm">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Master Waybill
            </p>

            <p className="mt-2 break-all text-lg font-semibold">
              {manifest.waybillNumber || "Not assigned"}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {manifest.carrier?.name || "No carrier attached"}
            </p>
          </div>

          <div className="rounded-xl border bg-background p-5 shadow-sm">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Packages
            </p>

            <p className="mt-2 text-lg font-semibold">{packages.length}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {uniqueShipments} unique shipments
            </p>
          </div>

          <div className="rounded-xl border bg-background p-5 shadow-sm">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Departure
            </p>

            <p className="mt-2 text-lg font-semibold">
              {manifest.departureDate
                ? new Date(manifest.departureDate).toLocaleString()
                : "Not set"}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Planned / actual departure
            </p>
          </div>

          <div className="rounded-xl border bg-background p-5 shadow-sm">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Arrival
            </p>

            <p className="mt-2 text-lg font-semibold">
              {manifest.arrivalDate
                ? new Date(manifest.arrivalDate).toLocaleString()
                : "Not arrived"}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Master shipment arrival
            </p>
          </div>
        </div>

        {/* ====================================================
            DHL
        ==================================================== */}

        {manifest.carrier?.code?.toUpperCase() === "DHL" &&
          manifest.waybillNumber && (
            <div className="flex flex-col gap-3 rounded-xl border bg-background p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">DHL master tracking</p>

                <p className="text-sm text-muted-foreground">
                  Sync DHL events into this manifest timeline.
                </p>
              </div>

              <Button
                variant="outline"
                disabled={actionLoading}
                onClick={() =>
                  run(() => manifestApi.syncDhl(id), "DHL tracking synced.")
                }
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync DHL Tracking
              </Button>
            </div>
          )}

        {/* ====================================================
            PACKAGES
        ==================================================== */}

        <div className="rounded-xl border bg-background shadow-sm">
          <div className="border-b p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">Manifest Packages</h2>

                <p className="text-sm text-muted-foreground">
                  Each package remains individually identifiable and trackable.
                </p>
              </div>

              <span className="w-fit shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {packages.length} pieces
              </span>
            </div>
          </div>

          <div className="divide-y">
            {packages.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <PackageIcon className="mx-auto mb-3 h-8 w-8 opacity-50" />

                <p>No packages added yet.</p>

                {draft && (
                  <p className="mt-1 text-xs">Use Add Packages above.</p>
                )}
              </div>
            ) : (
              packages.map((item) => (
                <div key={item.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="break-all font-semibold">
                          {item.package.packageCode}
                        </span>

                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          {item.package.status}
                        </span>

                        {item.partner && (
                          <span className="rounded-full border px-2 py-0.5 text-xs">
                            {item.partner.companyName}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 grid gap-2 text-sm text-muted-foreground md:grid-cols-3 md:gap-4">
                        <span className="min-w-0">
                          Shipment:{" "}
                          <b className="break-all text-foreground">
                            {item.package.shipment?.trackingNumber || "—"}
                          </b>
                        </span>

                        <span>
                          Weight:{" "}
                          <b className="text-foreground">
                            {moneyOrNumber(item.package.weightKg)} kg
                          </b>
                        </span>

                        <span>
                          Customer:{" "}
                          <b className="text-foreground">
                            {item.package.shipment?.customer?.fullName || "—"}
                          </b>
                        </span>
                      </div>

                      {item.package.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {item.package.description}
                        </p>
                      )}
                    </div>

                    {draft && (
                      <Button
                        variant="outline"
                        className="w-full text-destructive hover:text-destructive sm:w-auto"
                        disabled={actionLoading}
                        onClick={() =>
                          void handleRemovePackage(
                            item.packageId,
                            item.package.packageCode,
                          )
                        }
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ====================================================
            WORKFLOW
        ==================================================== */}

        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />

            <h2 className="font-semibold">Manifest Workflow</h2>
          </div>

          <Separator className="my-4" />

          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["DRAFT", "Create & add packages"],
              ["FINALIZED", "Lock manifest"],
              ["DEPARTED", "Master shipment left"],
              ["ARRIVED", "Master shipment arrived"],
            ].map(([status, text]) => (
              <div
                key={status}
                className={`rounded-lg border p-4 transition ${
                  manifest.status === status ? "ring-2 ring-primary/30" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {manifest.status === status ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border" />
                  )}

                  <p className="text-sm font-semibold">{status}</p>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
