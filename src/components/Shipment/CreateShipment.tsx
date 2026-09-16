"use client";

import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";

import {
  AlertCircle,
  ArrowLeft,
  Calculator,
  Check,
  ChevronDown,
  FileText,
  ImagePlus,
  Loader2,
  MapPin,
  Package,
  Plane,
  Plus,
  RefreshCw,
  Save,
  Ship,
  Trash2,
  Truck,
  User,
  Weight,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";
import { useSelector } from "react-redux";

// ============================================================
// TYPES
// ============================================================

interface Partner {
  id: string;
  companyName: string;
  trackingPrefix?: string;
  isActive?: boolean;
}

interface Customer {
  id: string;
  fullName?: string;
  name?: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  partnerId?: string;
  isActive?: boolean;
}

interface ShipmentResponse {
  id: string;
  trackingNumber: string;
  status: string;
}

interface Location {
  id: string;
  name: string;
  code: string;
  country: string;
  type: string;
}

interface Rate {
  id: string;
  destinationId: string;
  destinationLocation?: Location;
  mode: string;
  ratePerKg: number | string;
}

interface DraftManifest {
  id: string;
  manifestCode: string;
  status: string;
  mode: "AIR" | "SEA";
  origin?: string;
  destination?: string;
  originId?: string;
  destinationId?: string;
  departureDate?: string | null;
}

interface PackageImage {
  id: string;
  file: File;
  preview: string;
}

interface PackageForm {
  id: string;
  description: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  photos: PackageImage[];
}

// ============================================================
// CONSTANTS
// ============================================================

const VOLUMETRIC_DIVISOR = 5000;

const MAX_PACKAGE_IMAGES = 3;

const MAX_PACKAGES = 100;

const MODE_OPTIONS = [
  {
    value: "",
    label: "Select shipping mode",
  },
  {
    value: "AIR",
    label: "Air",
  },
  {
    value: "SEA",
    label: "Sea",
  },
];

// ============================================================
// HELPERS
// ============================================================

const formatAmount = (value: number | string | null | undefined) => {
  return Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getCustomerName = (customer?: Customer) => {
  return customer?.fullName || customer?.name || "Unnamed Customer";
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createEmptyPackage = (): PackageForm => ({
  id: generateId(),
  description: "",
  weightKg: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  photos: [],
});

// ============================================================
// PAGE
// ============================================================

const CreateShipment = () => {
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);

  const basePath = getDashboardPath(user?.role);

  // ==========================================================
  // ROLE
  // ==========================================================

  const isPartnerUser = user?.userType === "PARTNER_EMPLOYEE";

  const ownPartnerId = user?.partnerId || "";

  // ==========================================================
  // STATE
  // ==========================================================

  const [partners, setPartners] = useState<Partner[]>([]);

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [locations, setLocations] = useState<Location[]>([]);

  const [rates, setRates] = useState<Rate[]>([]);

  const [draftManifests, setDraftManifests] = useState<DraftManifest[]>([]);

  const [selectedPartnerId, setSelectedPartnerId] = useState("");

  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const [selectedManifestId, setSelectedManifestId] = useState("");

  const [loadingPartners, setLoadingPartners] = useState(false);

  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [loadingLocations, setLoadingLocations] = useState(false);

  const [loadingRates, setLoadingRates] = useState(false);

  const [loadingManifests, setLoadingManifests] = useState(false);

  const [refreshingCustomers, setRefreshingCustomers] = useState(false);

  const [refreshingManifests, setRefreshingManifests] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [packages, setPackages] = useState<PackageForm[]>([
    createEmptyPackage(),
  ]);

  const [form, setForm] = useState({
    mode: "",
    originId: "",
    destinationId: "",
    retailRatePerKg: "",
    discount: "0",
    additionalFees: "0",
  });

  // ==========================================================
  // EFFECTIVE PARTNER
  // ==========================================================

  const effectivePartnerId = useMemo(() => {
    if (isPartnerUser) {
      return ownPartnerId;
    }

    return selectedPartnerId;
  }, [isPartnerUser, ownPartnerId, selectedPartnerId]);

  // ==========================================================
  // SELECTED MANIFEST
  // ==========================================================

  const selectedManifest = useMemo(() => {
    return draftManifests.find(
      (manifest) => manifest.id === selectedManifestId,
    );
  }, [draftManifests, selectedManifestId]);

  // ==========================================================
  // FETCH LOCATIONS
  // ==========================================================

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);

      const res = await api.get("/api/v1/locations?isActive=true");

      const data = res.data?.data;

      const list: Location[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.result)
            ? data.result
            : [];

      setLocations(list);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load locations");

      setLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  // ==========================================================
  // FETCH PARTNERS
  // ==========================================================

  const fetchPartners = async () => {
    if (isPartnerUser) return;

    try {
      setLoadingPartners(true);

      const res = await api.get("/api/v1/partner");

      const data = res.data?.data;

      let list: Partner[] = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.result)) {
        list = data.result;
      }

      const activePartners = list.filter(
        (partner) => partner.isActive !== false,
      );

      setPartners(activePartners);

      if (activePartners.length === 1) {
        setSelectedPartnerId(activePartners[0].id);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load partners");
    } finally {
      setLoadingPartners(false);
    }
  };

  // ==========================================================
  // FETCH CUSTOMERS
  // ==========================================================

  const fetchCustomers = async (partnerId: string) => {
    if (!partnerId) {
      setCustomers([]);
      setSelectedCustomerId("");
      return;
    }

    try {
      setLoadingCustomers(true);

      const res = await api.get(
        `/api/v1/customer?partnerId=${encodeURIComponent(partnerId)}`,
      );

      const data = res.data?.data;

      let list: Customer[] = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.result)) {
        list = data.result;
      }

      setCustomers(list.filter((customer) => customer.isActive !== false));

      setSelectedCustomerId("");
    } catch (error: any) {
      setCustomers([]);
      setSelectedCustomerId("");

      toast.error(error?.response?.data?.message || "Failed to load customers");
    } finally {
      setLoadingCustomers(false);
      setRefreshingCustomers(false);
    }
  };

  // ==========================================================
  // FETCH RATES
  // ==========================================================

  const fetchRates = async (partnerId: string) => {
    if (!partnerId) {
      setRates([]);
      return;
    }

    try {
      setLoadingRates(true);

      const res = await api.get(`/api/v1/partner/${partnerId}/rates`);

      const data = res.data?.data;

      let list: Rate[] = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.result)) {
        list = data.result;
      }

      setRates(list);
    } catch (error: any) {
      setRates([]);

      toast.error(error?.response?.data?.message || "Failed to load rates");
    } finally {
      setLoadingRates(false);
    }
  };

  // ==========================================================
  // FETCH DRAFT MANIFESTS
  //
  // Expected endpoint:
  // GET /api/v1/master-manifest?status=DRAFT
  //
  // If your actual route is different, only change this URL.
  // ==========================================================

  const fetchDraftManifests = async () => {
    try {
      setLoadingManifests(true);

      const res = await api.get("/api/v1/manifest");

      const data = res.data?.data;

      let list: DraftManifest[] = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.result)) {
        list = data.result;
      }

      setDraftManifests(list.filter((manifest) => manifest.status === "DRAFT"));
    } catch (error: any) {
      console.error("Failed to load draft manifests:", error);

      setDraftManifests([]);
    } finally {
      setLoadingManifests(false);
      setRefreshingManifests(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    if (!user) return;

    fetchLocations();

    fetchDraftManifests();

    if (!isPartnerUser) {
      fetchPartners();
    }
  }, [user, isPartnerUser]);

  // ==========================================================
  // LOAD CUSTOMERS
  // ==========================================================

  useEffect(() => {
    if (!effectivePartnerId) {
      setCustomers([]);
      setSelectedCustomerId("");
      return;
    }

    fetchCustomers(effectivePartnerId);
  }, [effectivePartnerId]);

  // ==========================================================
  // LOAD RATES
  // ==========================================================

  useEffect(() => {
    if (!effectivePartnerId) {
      setRates([]);

      setForm((prev) => ({
        ...prev,
        destinationId: "",
        retailRatePerKg: "",
      }));

      return;
    }

    fetchRates(effectivePartnerId);
  }, [effectivePartnerId]);

  // ==========================================================
  // FILTER RATES
  // ==========================================================

  const filteredRates = useMemo(() => {
    if (!form.mode) {
      return rates;
    }

    return rates.filter((rate) => !rate.mode || rate.mode === form.mode);
  }, [rates, form.mode]);

  // ==========================================================
  // FILTER MANIFESTS
  //
  // A manifest should match:
  // - DRAFT
  // - same mode
  // - same origin
  // - same destination
  // ==========================================================

  const compatibleManifests = useMemo(() => {
    return draftManifests.filter((manifest) => {
      if (form.mode && manifest.mode && manifest.mode !== form.mode) {
        return false;
      }

      if (
        form.originId &&
        manifest.originId &&
        manifest.originId !== form.originId
      ) {
        return false;
      }

      if (
        form.destinationId &&
        manifest.destinationId &&
        manifest.destinationId !== form.destinationId
      ) {
        return false;
      }

      return true;
    });
  }, [draftManifests, form.mode, form.originId, form.destinationId]);

  // ==========================================================
  // DESTINATION CHANGE
  // ==========================================================

  const handleDestinationChange = (destinationId: string) => {
    const matched = filteredRates.find(
      (rate) => rate.destinationId === destinationId,
    );

    setForm((prev) => ({
      ...prev,
      destinationId,
      retailRatePerKg: matched ? String(matched.ratePerKg) : "",
    }));

    // Existing manifest may no longer match.
    if (
      selectedManifest &&
      selectedManifest.destinationId &&
      selectedManifest.destinationId !== destinationId
    ) {
      setSelectedManifestId("");
    }
  };

  // ==========================================================
  // MODE CHANGE
  // ==========================================================

  const handleModeChange = (mode: string) => {
    const modeRates = rates.filter((rate) => !rate.mode || rate.mode === mode);

    const currentDestinationExists = modeRates.some(
      (rate) => rate.destinationId === form.destinationId,
    );

    if (!currentDestinationExists) {
      setForm((prev) => ({
        ...prev,
        mode,
        destinationId: "",
        retailRatePerKg: "",
      }));

      setSelectedManifestId("");

      return;
    }

    const matched = modeRates.find(
      (rate) => rate.destinationId === form.destinationId,
    );

    setForm((prev) => ({
      ...prev,
      mode,
      retailRatePerKg: matched ? String(matched.ratePerKg) : "",
    }));

    if (selectedManifest && selectedManifest.mode !== mode) {
      setSelectedManifestId("");
    }
  };

  // ==========================================================
  // ORIGIN CHANGE
  // ==========================================================

  const handleOriginChange = (originId: string) => {
    setForm((prev) => ({
      ...prev,
      originId,
    }));

    if (
      selectedManifest &&
      selectedManifest.originId &&
      selectedManifest.originId !== originId
    ) {
      setSelectedManifestId("");
    }
  };

  // ==========================================================
  // PARTNER CHANGE
  // ==========================================================

  const handlePartnerChange = (partnerId: string) => {
    setSelectedPartnerId(partnerId);

    setSelectedCustomerId("");

    setCustomers([]);

    setRates([]);

    setSelectedManifestId("");

    setForm((prev) => ({
      ...prev,
      destinationId: "",
      retailRatePerKg: "",
    }));
  };

  // ==========================================================
  // IMAGE CHANGE
  // ==========================================================

  const handlePackageImages = (
    packageId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    setPackages((current) =>
      current.map((pkg) => {
        if (pkg.id !== packageId) {
          return pkg;
        }

        const remainingSlots = MAX_PACKAGE_IMAGES - pkg.photos.length;

        if (remainingSlots <= 0) {
          toast.error(
            `Maximum ${MAX_PACKAGE_IMAGES} images allowed per package`,
          );

          return pkg;
        }

        const filesToAdd = selectedFiles.slice(0, remainingSlots);

        if (selectedFiles.length > remainingSlots) {
          toast.error(
            `Maximum ${MAX_PACKAGE_IMAGES} images allowed per package`,
          );
        }

        const newPhotos: PackageImage[] = filesToAdd.map((file) => ({
          id: generateId(),
          file,
          preview: URL.createObjectURL(file),
        }));

        return {
          ...pkg,
          photos: [...pkg.photos, ...newPhotos],
        };
      }),
    );

    event.target.value = "";
  };

  // ==========================================================
  // REMOVE IMAGE
  // ==========================================================

  const removePackageImage = (packageId: string, photoId: string) => {
    setPackages((current) =>
      current.map((pkg) => {
        if (pkg.id !== packageId) {
          return pkg;
        }

        const target = pkg.photos.find((photo) => photo.id === photoId);

        if (target) {
          URL.revokeObjectURL(target.preview);
        }

        return {
          ...pkg,
          photos: pkg.photos.filter((photo) => photo.id !== photoId),
        };
      }),
    );
  };

  // ==========================================================
  // PACKAGE CHANGE
  // ==========================================================

  const updatePackage = (
    packageId: string,
    field: "description" | "weightKg" | "lengthCm" | "widthCm" | "heightCm",
    value: string,
  ) => {
    setPackages((current) =>
      current.map((pkg) =>
        pkg.id === packageId
          ? {
              ...pkg,
              [field]: value,
            }
          : pkg,
      ),
    );
  };

  // ==========================================================
  // ADD PACKAGE
  // ==========================================================

  const addPackage = () => {
    if (packages.length >= MAX_PACKAGES) {
      toast.error(`Maximum ${MAX_PACKAGES} packages allowed.`);
      return;
    }

    setPackages((current) => [...current, createEmptyPackage()]);
  };

  // ==========================================================
  // REMOVE PACKAGE
  // ==========================================================

  const removePackage = (packageId: string) => {
    if (packages.length === 1) {
      toast.error("At least one package is required");
      return;
    }

    const target = packages.find((pkg) => pkg.id === packageId);

    target?.photos.forEach((photo) => {
      URL.revokeObjectURL(photo.preview);
    });

    setPackages((current) => current.filter((pkg) => pkg.id !== packageId));
  };

  // ==========================================================
  // CLEANUP OBJECT URLS
  // ==========================================================

  useEffect(() => {
    return () => {
      packages.forEach((pkg) => {
        pkg.photos.forEach((photo) => {
          URL.revokeObjectURL(photo.preview);
        });
      });
    };
  }, []);

  // ==========================================================
  // PACKAGE CALCULATIONS
  // ==========================================================

  const packageCalculations = useMemo(() => {
    return packages.map((pkg) => {
      const weight = Number(pkg.weightKg || 0);

      const length = Number(pkg.lengthCm || 0);

      const width = Number(pkg.widthCm || 0);

      const height = Number(pkg.heightCm || 0);

      const volumetric =
        length > 0 && width > 0 && height > 0
          ? (length * width * height) / VOLUMETRIC_DIVISOR
          : 0;

      const chargeable = Math.max(weight, volumetric);

      return {
        weight,
        volumetric,
        chargeable,
      };
    });
  }, [packages]);

  // ==========================================================
  // TOTAL CALCULATION
  // ==========================================================

  const calculation = useMemo(() => {
    const actual = packageCalculations.reduce(
      (sum, item) => sum + item.weight,
      0,
    );

    const volumetric = packageCalculations.reduce(
      (sum, item) => sum + item.volumetric,
      0,
    );

    const chargeableWeight = packageCalculations.reduce(
      (sum, item) => sum + item.chargeable,
      0,
    );

    const retailRate = Number(form.retailRatePerKg || 0);

    const discount = Number(form.discount || 0);

    const additionalFees = Number(form.additionalFees || 0);

    const customerPrice = chargeableWeight * retailRate;

    const finalAmount = customerPrice - discount + additionalFees;

    return {
      actual,
      volumetric,
      chargeableWeight,
      retailRate,
      discount,
      additionalFees,
      customerPrice,
      finalAmount,
    };
  }, [packageCalculations, form]);

  // ==========================================================
  // VALIDATE
  // ==========================================================

  const validateForm = () => {
    if (!effectivePartnerId) {
      toast.error("Partner information is required");
      return false;
    }

    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return false;
    }

    if (!form.mode) {
      toast.error("Please select shipment mode");
      return false;
    }

    if (form.mode !== "AIR" && form.mode !== "SEA") {
      toast.error("Only AIR and SEA shipping modes are allowed.");
      return false;
    }

    if (!form.originId) {
      toast.error("Origin is required");
      return false;
    }

    if (!form.destinationId) {
      toast.error("Destination is required");
      return false;
    }

    if (form.originId === form.destinationId) {
      toast.error("Origin and destination cannot be the same.");
      return false;
    }

    if (!packages.length) {
      toast.error("At least one package is required");
      return false;
    }

    for (let index = 0; index < packages.length; index++) {
      const pkg = packages[index];

      if (!pkg.weightKg || Number(pkg.weightKg) <= 0) {
        toast.error(`Package ${index + 1}: weight must be greater than 0`);
        return false;
      }

      if (!Number.isFinite(Number(pkg.weightKg))) {
        toast.error(`Package ${index + 1}: invalid weight`);
        return false;
      }

      const dimensions = [pkg.lengthCm, pkg.widthCm, pkg.heightCm];

      const hasAnyDimension = dimensions.some((value) => value !== "");

      if (hasAnyDimension) {
        const allProvided = dimensions.every(
          (value) => value !== "" && Number(value) > 0,
        );

        if (!allProvided) {
          toast.error(`Package ${index + 1}: enter all dimensions`);
          return false;
        }
      }

      if (pkg.photos.length > MAX_PACKAGE_IMAGES) {
        toast.error(
          `Package ${index + 1}: maximum ${MAX_PACKAGE_IMAGES} images allowed`,
        );
        return false;
      }
    }

    if (form.retailRatePerKg === "" || calculation.retailRate < 0) {
      toast.error("Retail rate cannot be negative");
      return false;
    }

    if (calculation.discount < 0) {
      toast.error("Discount cannot be negative");
      return false;
    }

    if (calculation.additionalFees < 0) {
      toast.error("Additional fees cannot be negative");
      return false;
    }

    if (calculation.finalAmount < 0) {
      toast.error("Final customer amount cannot be negative");
      return false;
    }

    // --------------------------------------------------------
    // Validate selected manifest
    // --------------------------------------------------------

    if (selectedManifest) {
      if (selectedManifest.status !== "DRAFT") {
        toast.error("Only a DRAFT manifest can be selected.");
        return false;
      }

      if (selectedManifest.mode !== form.mode) {
        toast.error("Selected manifest mode does not match shipment mode.");
        return false;
      }

      if (
        selectedManifest.originId &&
        selectedManifest.originId !== form.originId
      ) {
        toast.error("Selected manifest origin does not match shipment origin.");
        return false;
      }

      if (
        selectedManifest.destinationId &&
        selectedManifest.destinationId !== form.destinationId
      ) {
        toast.error(
          "Selected manifest destination does not match shipment destination.",
        );
        return false;
      }
    }

    return true;
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const data = {
        ...(isPartnerUser
          ? {}
          : {
              partnerId: selectedPartnerId,
            }),

        customerId: selectedCustomerId,

        // ----------------------------------------------------
        // IMPORTANT
        // Optional DRAFT manifest.
        //
        // If selected, backend should:
        // 1. create shipment
        // 2. create packages
        // 3. add packages to this DRAFT manifest
        // 4. mark packages MANIFESTED
        // 5. mark shipment MANIFESTED
        // ----------------------------------------------------

        ...(selectedManifestId
          ? {
              manifestId: selectedManifestId,
            }
          : {}),

        mode: form.mode,

        originId: form.originId,

        destinationId: form.destinationId,

        retailRatePerKg: calculation.retailRate,

        discount: calculation.discount,

        additionalFees: calculation.additionalFees,

        packages: packages.map((pkg) => ({
          description: pkg.description.trim() || undefined,

          weightKg: Number(pkg.weightKg),

          lengthCm: pkg.lengthCm ? Number(pkg.lengthCm) : undefined,

          widthCm: pkg.widthCm ? Number(pkg.widthCm) : undefined,

          heightCm: pkg.heightCm ? Number(pkg.heightCm) : undefined,
        })),
      };

      const formData = new FormData();

      formData.append("data", JSON.stringify(data));

      // ------------------------------------------------------
      // IMPORTANT IMAGE ORDER
      //
      // Package 1 -> all images
      // Package 2 -> all images
      // Package 3 -> all images
      //
      // Backend must read sequentially.
      // ------------------------------------------------------

      packages.forEach((pkg) => {
        pkg.photos.forEach((photo) => {
          formData.append("images", photo.file);
        });
      });

      const res = await api.post("/api/v1/shipment", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const createdShipment: ShipmentResponse | undefined = res.data?.data;

      if (!createdShipment) {
        throw new Error("Shipment was created but response data was not found");
      }

      toast.success(
        selectedManifest
          ? `Shipment ${createdShipment.trackingNumber} created and added to ${selectedManifest.manifestCode}`
          : `Shipment ${createdShipment.trackingNumber} created successfully`,
      );

      // ======================================================
      // REDIRECT
      // ======================================================

      if (isPartnerUser && ownPartnerId) {
        router.push(
          `${basePath}/partners/${ownPartnerId}/shipments/${createdShipment.id}`,
        );

        return;
      }

      if (selectedPartnerId) {
        router.push(
          `${basePath}/partners/${selectedPartnerId}/shipments/${createdShipment.id}`,
        );

        return;
      }

      router.push(`${basePath}/shipments/${createdShipment.id}`);
    } catch (error: any) {
      console.error("Failed to create shipment:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create shipment",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // BACK
  // ==========================================================

  const handleBack = () => {
    if (isPartnerUser && ownPartnerId) {
      router.push(`${basePath}/partners/${ownPartnerId}/shipments`);

      return;
    }

    if (selectedPartnerId) {
      router.push(`${basePath}/partners/${selectedPartnerId}/shipments`);

      return;
    }

    router.push(`${basePath}/shipments`);
  };

  // ==========================================================
  // REFRESH MANIFESTS
  // ==========================================================

  const refreshManifests = async () => {
    try {
      setRefreshingManifests(true);

      await fetchDraftManifests();

      toast.success("Manifest list refreshed.");
    } catch {
      // fetchDraftManifests already handles error
    }
  };

  // ==========================================================
  // SELECTED
  // ==========================================================

  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId,
  );

  const selectedPartner = partners.find(
    (partner) => partner.id === selectedPartnerId,
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ==================================================
            HEADER
        =================================================== */}

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={handleBack}
              className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
            >
              <ArrowLeft size={16} />
              Back to Shipments
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10">
                <Package size={22} className="text-secondary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Create Shipment
                </h1>

                <p className="mt-0.5 text-sm text-gray-500">
                  Create a shipment with one or multiple packages.
                </p>
              </div>
            </div>
          </div>

          {isPartnerUser ? (
            <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <Truck size={18} className="text-gray-600" />
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400">
                  Partner
                </p>

                <p className="text-sm font-semibold text-gray-800">
                  Your Partner Account
                </p>
              </div>
            </div>
          ) : selectedPartner ? (
            <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <Truck size={18} className="text-gray-600" />
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400">
                  Partner
                </p>

                <p className="text-sm font-semibold text-gray-800">
                  {selectedPartner.companyName}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* ==================================================
            FORM
        =================================================== */}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* ==================================================
                LEFT
            =================================================== */}

            <div className="space-y-6">
              {/* ==================================================
                  PARTNER & CUSTOMER
              =================================================== */}

              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                      <User size={18} className="text-blue-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Partner & Customer
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-500">
                        Select who is sending this shipment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className={`grid grid-cols-1 gap-5 ${
                      isPartnerUser ? "md:grid-cols-1" : "md:grid-cols-2"
                    }`}
                  >
                    {!isPartnerUser && (
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Partner <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <select
                            value={selectedPartnerId}
                            onChange={(e) =>
                              handlePartnerChange(e.target.value)
                            }
                            disabled={loadingPartners}
                            className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 pr-10 text-sm outline-none transition focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50"
                          >
                            <option value="">
                              {loadingPartners
                                ? "Loading partners..."
                                : "Select partner"}
                            </option>

                            {partners.map((partner) => (
                              <option key={partner.id} value={partner.id}>
                                {partner.companyName}

                                {partner.trackingPrefix
                                  ? ` (${partner.trackingPrefix})`
                                  : ""}
                              </option>
                            ))}
                          </select>

                          <ChevronDown
                            size={17}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Customer <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <select
                          value={selectedCustomerId}
                          onChange={(e) =>
                            setSelectedCustomerId(e.target.value)
                          }
                          disabled={
                            !effectivePartnerId ||
                            loadingCustomers ||
                            customers.length === 0
                          }
                          className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 pr-10 text-sm outline-none transition focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50"
                        >
                          <option value="">
                            {!effectivePartnerId
                              ? "Select partner first"
                              : loadingCustomers
                                ? "Loading customers..."
                                : customers.length === 0
                                  ? "No customers found"
                                  : "Select customer"}
                          </option>

                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {getCustomerName(customer)}

                              {customer.phone ? ` — ${customer.phone}` : ""}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>

                      {selectedCustomer && (
                        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3">
                          <p className="text-xs text-gray-400">
                            Selected Customer
                          </p>

                          <p className="mt-0.5 text-sm font-medium text-gray-800">
                            {getCustomerName(selectedCustomer)}
                          </p>

                          {selectedCustomer.phone && (
                            <p className="mt-0.5 text-xs text-gray-500">
                              {selectedCustomer.phone}
                            </p>
                          )}
                        </div>
                      )}

                      {effectivePartnerId && (
                        <button
                          type="button"
                          onClick={async () => {
                            setRefreshingCustomers(true);

                            await fetchCustomers(effectivePartnerId);
                          }}
                          disabled={loadingCustomers || refreshingCustomers}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:underline disabled:opacity-50"
                        >
                          <RefreshCw
                            size={12}
                            className={
                              refreshingCustomers ? "animate-spin" : ""
                            }
                          />

                          {refreshingCustomers
                            ? "Refreshing..."
                            : "Refresh customers"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* ==================================================
                  ROUTE
              =================================================== */}

              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                      <MapPin size={18} className="text-purple-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Shipment Route
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-500">
                        Specify the shipping method and route.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {/* MODE */}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Shipping Mode <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <select
                          value={form.mode}
                          onChange={(e) => handleModeChange(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 pr-10 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                        >
                          {MODE_OPTIONS.map((mode) => (
                            <option key={mode.value} value={mode.value}>
                              {mode.label}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>

                      {form.mode && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                          {form.mode === "AIR" ? (
                            <>
                              <Plane size={13} />
                              Air shipment
                            </>
                          ) : (
                            <>
                              <Ship size={13} />
                              Sea shipment
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ORIGIN */}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Origin <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <select
                          value={form.originId}
                          onChange={(e) => handleOriginChange(e.target.value)}
                          disabled={loadingLocations}
                          className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 pr-10 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50"
                        >
                          <option value="">
                            {loadingLocations
                              ? "Loading locations..."
                              : "Select origin"}
                          </option>

                          {locations.map((location) => (
                            <option key={location.id} value={location.id}>
                              {location.name} ({location.code})
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>
                    </div>

                    {/* DESTINATION */}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Destination <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <select
                          value={form.destinationId}
                          onChange={(e) =>
                            handleDestinationChange(e.target.value)
                          }
                          disabled={
                            !effectivePartnerId ||
                            loadingRates ||
                            filteredRates.length === 0
                          }
                          className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 pr-10 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50"
                        >
                          <option value="">
                            {!effectivePartnerId
                              ? "Select partner first"
                              : loadingRates
                                ? "Loading destinations..."
                                : filteredRates.length === 0
                                  ? "No destinations available"
                                  : "Select destination"}
                          </option>

                          {filteredRates.map((rate) => {
                            const destination =
                              rate.destinationLocation ||
                              locations.find(
                                (location) =>
                                  location.id === rate.destinationId,
                              );

                            return (
                              <option key={rate.id} value={rate.destinationId}>
                                {destination?.name || "Unknown Destination"} (
                                {destination?.code || "N/A"}) — $
                                {Number(rate.ratePerKg).toFixed(2)}
                                /kg
                              </option>
                            );
                          })}
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ==================================================
                  MANIFEST
              =================================================== */}

              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b px-6 py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                        <FileText size={18} className="text-indigo-600" />
                      </div>

                      <div>
                        <h2 className="font-semibold text-gray-900">
                          Master Manifest
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">
                          Optional — add these packages directly to an existing
                          DRAFT manifest.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={refreshManifests}
                      disabled={loadingManifests || refreshingManifests}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-secondary hover:underline disabled:opacity-50"
                    >
                      <RefreshCw
                        size={13}
                        className={
                          loadingManifests || refreshingManifests
                            ? "animate-spin"
                            : ""
                        }
                      />
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Select DRAFT Manifest
                      </label>

                      <div className="relative">
                        <select
                          value={selectedManifestId}
                          onChange={(e) =>
                            setSelectedManifestId(e.target.value)
                          }
                          disabled={
                            loadingManifests || compatibleManifests.length === 0
                          }
                          className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 pr-10 text-sm outline-none transition focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50"
                        >
                          <option value="">
                            {loadingManifests
                              ? "Loading manifests..."
                              : !form.mode ||
                                  !form.originId ||
                                  !form.destinationId
                                ? "Select mode, origin & destination first"
                                : compatibleManifests.length === 0
                                  ? "No compatible DRAFT manifests"
                                  : "No manifest — keep shipment unmanifested"}
                          </option>

                          {compatibleManifests.map((manifest) => (
                            <option key={manifest.id} value={manifest.id}>
                              {manifest.manifestCode} — {manifest.mode} —{" "}
                              {manifest.origin || "Origin"} →{" "}
                              {manifest.destination || "Destination"}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        Leave empty if the shipment should be created first and
                        manifested later.
                      </p>
                    </div>

                    {/* MANIFEST STATUS */}

                    <div className="flex items-end">
                      {selectedManifest ? (
                        <div className="w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 lg:min-w-[260px]">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                              <FileText size={15} className="text-indigo-600" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-wide text-indigo-500">
                                Selected Manifest
                              </p>

                              <p className="mt-0.5 break-all text-sm font-semibold text-indigo-900">
                                {selectedManifest.manifestCode}
                              </p>

                              <p className="mt-1 text-xs text-indigo-700">
                                DRAFT · {selectedManifest.mode}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedManifestId("")}
                              className="ml-auto shrink-0 rounded-md p-1 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700"
                              title="Remove manifest"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex w-full items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-500 lg:min-w-[260px]">
                          <AlertCircle size={15} className="shrink-0" />

                          <span>
                            No manifest selected. Shipment will remain in the
                            normal workflow.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedManifest && (
                    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                      <div className="flex gap-3">
                        <Check
                          size={17}
                          className="mt-0.5 shrink-0 text-indigo-600"
                        />

                        <div>
                          <p className="text-sm font-medium text-indigo-900">
                            Create & Manifest together
                          </p>

                          <p className="mt-1 text-xs leading-5 text-indigo-700">
                            All packages in this shipment will be created and
                            added to <b>{selectedManifest.manifestCode}</b>
                            during shipment creation. The manifest will remain
                            DRAFT until it is finalized.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ==================================================
                  PACKAGES
              =================================================== */}

              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                      <Package size={18} className="text-orange-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">Packages</h2>

                      <p className="mt-0.5 text-xs text-gray-500">
                        Add all packages belonging to this shipment.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                    {packages.length}{" "}
                    {packages.length === 1 ? "Package" : "Packages"}
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  {packages.map((pkg, index) => {
                    const packageCalc = packageCalculations[index];

                    return (
                      <div
                        key={pkg.id}
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/60"
                      >
                        {/* PACKAGE HEADER */}

                        <div className="flex items-center justify-between border-b bg-white px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">
                              P{index + 1}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                Package {index + 1} of {packages.length}
                              </p>

                              <p className="text-xs text-gray-500">
                                P{index + 1} / {packages.length}
                              </p>
                            </div>
                          </div>

                          {packages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePackage(pkg.id)}
                              disabled={submitting}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              title="Remove package"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>

                        <div className="space-y-5 p-5">
                          {/* WEIGHT + DESCRIPTION */}

                          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {/* WEIGHT */}

                            <div>
                              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Weight <span className="text-red-500">*</span>
                              </label>

                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={pkg.weightKg}
                                  onChange={(e) =>
                                    updatePackage(
                                      pkg.id,
                                      "weightKg",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="5.00"
                                  disabled={submitting}
                                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 pr-14 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50"
                                />

                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                                  KG
                                </span>
                              </div>
                            </div>

                            {/* DESCRIPTION */}

                            <div>
                              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Description
                              </label>

                              <input
                                type="text"
                                value={pkg.description}
                                onChange={(e) =>
                                  updatePackage(
                                    pkg.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g. Clothing, Electronics..."
                                disabled={submitting}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50"
                              />
                            </div>
                          </div>

                          {/* DIMENSIONS */}

                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                              Dimensions{" "}
                              <span className="font-normal text-gray-400">
                                (L × W × H cm)
                              </span>
                            </label>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={pkg.lengthCm}
                                onChange={(e) =>
                                  updatePackage(
                                    pkg.id,
                                    "lengthCm",
                                    e.target.value,
                                  )
                                }
                                placeholder="Length"
                                disabled={submitting}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50"
                              />

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={pkg.widthCm}
                                onChange={(e) =>
                                  updatePackage(
                                    pkg.id,
                                    "widthCm",
                                    e.target.value,
                                  )
                                }
                                placeholder="Width"
                                disabled={submitting}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50"
                              />

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={pkg.heightCm}
                                onChange={(e) =>
                                  updatePackage(
                                    pkg.id,
                                    "heightCm",
                                    e.target.value,
                                  )
                                }
                                placeholder="Height"
                                disabled={submitting}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50"
                              />
                            </div>

                            {packageCalc?.volumetric > 0 && (
                              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                                <span>
                                  Volumetric:{" "}
                                  <b className="text-gray-700">
                                    {packageCalc.volumetric.toFixed(2)} KG
                                  </b>
                                </span>

                                <span>
                                  Chargeable:{" "}
                                  <b className="text-gray-700">
                                    {packageCalc.chargeable.toFixed(2)} KG
                                  </b>
                                </span>
                              </div>
                            )}
                          </div>

                          {/* PHOTOS */}

                          <div>
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Package Photos
                                </label>

                                <p className="mt-0.5 text-xs text-gray-500">
                                  Add up to {MAX_PACKAGE_IMAGES} photos of this
                                  package.
                                </p>
                              </div>

                              <span className="shrink-0 text-xs font-medium text-gray-400">
                                {pkg.photos.length}/{MAX_PACKAGE_IMAGES}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2.5">
                              {pkg.photos.map((photo) => (
                                <div
                                  key={photo.id}
                                  className="group relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200 bg-white"
                                >
                                  <img
                                    src={photo.preview}
                                    alt={`Package ${index + 1} photo`}
                                    className="h-full w-full object-cover"
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removePackageImage(pkg.id, photo.id)
                                    }
                                    disabled={submitting}
                                    title="Remove photo"
                                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600 disabled:opacity-50"
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              ))}

                              {pkg.photos.length < MAX_PACKAGE_IMAGES && (
                                <label
                                  className={`flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white text-gray-400 transition hover:border-secondary hover:text-secondary ${
                                    submitting
                                      ? "pointer-events-none opacity-50"
                                      : ""
                                  }`}
                                >
                                  <ImagePlus size={18} />

                                  <span className="mt-1 text-[10px] font-medium">
                                    Add Photo
                                  </span>

                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    disabled={submitting}
                                    onChange={(e) =>
                                      handlePackageImages(pkg.id, e)
                                    }
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* ADD PACKAGE */}

                  <button
                    type="button"
                    onClick={addPackage}
                    disabled={submitting || packages.length >= MAX_PACKAGES}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-white px-4 py-4 text-sm font-semibold text-gray-600 transition hover:border-secondary hover:bg-secondary/5 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={18} />
                    Add Another Package
                    <span className="text-xs font-normal text-gray-400">
                      ({packages.length}/{MAX_PACKAGES})
                    </span>
                  </button>
                </div>
              </section>

              {/* ==================================================
                  PRICING
              =================================================== */}

              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                      <Weight size={18} className="text-green-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">Pricing</h2>

                      <p className="mt-0.5 text-xs text-gray-500">
                        Set customer rate and additional charges.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {/* RATE */}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Retail Rate / KG <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.retailRatePerKg}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              retailRatePerKg: e.target.value,
                            }))
                          }
                          placeholder="1200"
                          disabled={submitting}
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-8 pr-3.5 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    {/* DISCOUNT */}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Discount
                      </label>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.discount}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              discount: e.target.value,
                            }))
                          }
                          placeholder="500"
                          disabled={submitting}
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-8 pr-3.5 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    {/* ADDITIONAL */}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Additional Fees
                      </label>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.additionalFees}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              additionalFees: e.target.value,
                            }))
                          }
                          placeholder="200"
                          disabled={submitting}
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-8 pr-3.5 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* ==================================================
                SUMMARY
            =================================================== */}

            <div>
              <div className="sticky top-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* SUMMARY HEADER */}

                <div className="bg-gray-900 px-6 py-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                      <Calculator size={18} />
                    </div>

                    <div>
                      <h2 className="font-semibold">Shipment Summary</h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Live package & pricing calculation
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* MANIFEST SUMMARY */}

                  {selectedManifest && (
                    <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                      <div className="flex items-start gap-3">
                        <FileText
                          size={17}
                          className="mt-0.5 shrink-0 text-indigo-600"
                        />

                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wide text-indigo-500">
                            Manifest
                          </p>

                          <p className="mt-1 break-all text-sm font-bold text-indigo-900">
                            {selectedManifest.manifestCode}
                          </p>

                          <p className="mt-1 text-xs text-indigo-700">
                            Packages will be manifested during creation.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PACKAGE COUNT */}

                  <div className="mb-5 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Packages
                      </p>

                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {packages.length}
                      </p>
                    </div>

                    <Package size={24} className="text-gray-400" />
                  </div>

                  {/* WEIGHT */}

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Total Weight
                    </p>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Actual Weight</span>

                        <span className="font-medium text-gray-800">
                          {calculation.actual.toFixed(2)} KG
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Volumetric Weight</span>

                        <span className="font-medium text-gray-800">
                          {calculation.volumetric.toFixed(2)} KG
                        </span>
                      </div>

                      <div className="flex justify-between border-t pt-3">
                        <span className="font-medium text-gray-700">
                          Chargeable Weight
                        </span>

                        <span className="font-bold text-gray-900">
                          {calculation.chargeableWeight.toFixed(2)} KG
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PACKAGE LIST */}

                  <div className="mt-4 space-y-2">
                    {packages.map((pkg, index) => {
                      const calc = packageCalculations[index];

                      return (
                        <div
                          key={pkg.id}
                          className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5 text-xs"
                        >
                          <div>
                            <span className="font-medium text-gray-600">
                              P{index + 1} of {packages.length}
                            </span>

                            {calc?.volumetric > 0 && (
                              <span className="ml-2 text-gray-400">
                                Vol. {calc.volumetric.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <span className="font-semibold text-gray-800">
                            {Number(pkg.weightKg || 0).toFixed(2)} KG
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* PRICE */}

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rate / KG</span>

                      <span className="font-medium">
                        $ {calculation.retailRate.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer Price</span>

                      <span className="font-medium">
                        $ {calculation.customerPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount</span>

                      <span className="text-red-500">
                        - $ {calculation.discount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Additional Fees</span>

                      <span className="text-green-600">
                        + $ {calculation.additionalFees.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* TOTAL */}

                  <div className="mt-5 border-t pt-5">
                    <div className="rounded-xl border border-secondary/10 bg-secondary/5 p-4">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Final Amount
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Amount payable by customer
                          </p>
                        </div>

                        <p className="text-2xl font-bold text-secondary">
                          $ {formatAmount(calculation.finalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CREATE */}

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      loadingPartners ||
                      loadingCustomers ||
                      loadingLocations ||
                      loadingRates ||
                      loadingManifests ||
                      !effectivePartnerId ||
                      !selectedCustomerId
                    }
                    className="mt-6 w-full rounded-xl bg-secondary px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-secondary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />

                        {selectedManifest
                          ? "Creating & Manifesting..."
                          : "Creating Shipment..."}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Save size={18} />

                        {selectedManifest
                          ? "Create & Add to Manifest"
                          : "Create Shipment"}
                      </span>
                    )}
                  </button>

                  {/* WORKFLOW NOTE */}

                  <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="flex gap-2">
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0 text-green-600"
                      />

                      <p className="text-[11px] leading-5 text-gray-500">
                        {selectedManifest
                          ? "Shipment packages will be created and added to the selected DRAFT manifest. The manifest will not be finalized automatically."
                          : "Shipment will be created normally. You can add and manifest packages later from the shipment or manifest workflow."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                    <Check size={13} />

                    <span>All required fields must be completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShipment;
