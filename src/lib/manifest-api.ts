import api from "@/lib/axios";

export type ShipmentMode = "AIR" | "SEA";

export type ManifestStatus = "DRAFT" | "FINALIZED" | "DEPARTED" | "ARRIVED";

export interface ManifestPackage {
  id: string;
  packageId: string;
  shipmentId: string;
  partnerId: string;
  addedAt: string;

  package: {
    id: string;
    packageCode: string;
    packageNumber?: number | null;
    description?: string | null;

    weightKg: string | number;

    lengthCm?: string | number | null;
    widthCm?: string | number | null;
    heightCm?: string | number | null;

    status: string;

    shipment?: {
      id: string;
      trackingNumber: string;
      status: string;
      mode: ShipmentMode;

      origin: string;
      destination: string;

      customer?: {
        id: string;
        fullName: string;
        phone?: string | null;
        whatsapp?: string | null;
      } | null;
    } | null;
  };

  partner?: {
    id: string;
    companyName: string;
    trackingPrefix: string;
  } | null;
}

export interface Manifest {
  id: string;

  manifestCode: string;

  mode: ShipmentMode;

  origin: string;
  destination: string;

  status: ManifestStatus;

  departureDate?: string | null;
  arrivalDate?: string | null;

  carrierId?: string | null;
  waybillNumber?: string | null;
  carrierTrackingUrl?: string | null;

  carrier?: {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
  } | null;

  finalizedBy?: {
    id: string;
    fullName: string;
    email: string;
  } | null;

  _count?: {
    packages: number;
  };

  packages?: ManifestPackage[];
}

// ============================================================
// SHIPMENT LOOKUP
// ============================================================

export interface ManifestShipmentPackage {
  id: string;
  packageCode: string;
  packageNumber?: number | null;

  description?: string | null;

  weightKg: string | number;

  lengthCm?: string | number | null;
  widthCm?: string | number | null;
  heightCm?: string | number | null;

  status: string;

  manifestPackages?: {
    id: string;

    manifest: {
      id: string;
      manifestCode: string;
      status: ManifestStatus;
    };
  }[];
}

export interface ManifestShipment {
  id: string;

  partnerId: string;

  trackingNumber: string;

  status: string;

  mode: ShipmentMode;

  originId: string;
  destinationId: string;

  origin: string;
  destination: string;

  customer?: {
    id: string;
    fullName: string;
    phone?: string | null;
    whatsapp?: string | null;
  } | null;

  partner?: {
    id: string;
    companyName: string;
    trackingPrefix: string;
  } | null;

  packages: ManifestShipmentPackage[];

  totalPackages: number;

  alreadyManifestedPackages: number;
}

export interface Carrier {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

// ============================================================
// UNWRAP
// ============================================================

const unwrap = (res: any) => res?.data?.data ?? res?.data ?? res;

// ============================================================
// API
// ============================================================

export const manifestApi = {
  // ----------------------------------------------------------
  // MANIFESTS
  // ----------------------------------------------------------

  async getAll(): Promise<Manifest[]> {
    const res = await api.get("/api/v1/manifest");

    return unwrap(res);
  },

  async getById(id: string): Promise<Manifest> {
    const res = await api.get(`/api/v1/manifest/${id}`);

    return unwrap(res);
  },

  async create(payload: {
    mode: ShipmentMode;
    originId: string;
    destinationId: string;
    departureDate?: string;
  }) {
    const res = await api.post("/api/v1/manifest", payload);

    return unwrap(res);
  },

  async update(
    id: string,
    payload: {
      mode?: ShipmentMode;
      originId?: string;
      destinationId?: string;
      departureDate?: string | null;
    },
  ) {
    const res = await api.patch(`/api/v1/manifest/${id}`, payload);

    return unwrap(res);
  },

  // ----------------------------------------------------------
  // SHIPMENT LOOKUP
  // ----------------------------------------------------------

  async getShipmentForManifest(
    trackingNumber: string,
  ): Promise<ManifestShipment> {
    const res = await api.get(
      `/api/v1/manifest/shipment/${encodeURIComponent(trackingNumber)}`,
    );

    return unwrap(res);
  },

  // ----------------------------------------------------------
  // ADD ENTIRE SHIPMENT
  // ----------------------------------------------------------

  async addShipment(manifestId: string, trackingNumber: string) {
    const res = await api.post(`/api/v1/manifest/${manifestId}/shipments`, {
      trackingNumber,
    });

    return unwrap(res);
  },

  // ----------------------------------------------------------
  // INDIVIDUAL PACKAGE
  // ----------------------------------------------------------

  async addPackage(id: string, packageCode: string) {
    const res = await api.post(`/api/v1/manifest/${id}/packages`, {
      packageCode,
    });

    return unwrap(res);
  },

  async removePackage(id: string, packageId: string) {
    const res = await api.delete(
      `/api/v1/manifest/${id}/packages/${packageId}`,
    );

    return unwrap(res);
  },

  // ----------------------------------------------------------
  // WORKFLOW
  // ----------------------------------------------------------

  async finalize(id: string) {
    const res = await api.patch(`/api/v1/manifest/${id}/finalize`);

    return unwrap(res);
  },

  async depart(id: string) {
    const res = await api.patch(`/api/v1/manifest/${id}/depart`);

    return unwrap(res);
  },

  async arrive(id: string) {
    const res = await api.patch(`/api/v1/manifest/${id}/arrive`);

    return unwrap(res);
  },

  async delete(id: string) {
    const res = await api.delete(`/api/v1/manifest/${id}`);

    return unwrap(res);
  },

  // ----------------------------------------------------------
  // CARRIER
  // ----------------------------------------------------------

  async attachCarrier(
    id: string,
    payload: {
      carrierId: string;
      waybillNumber?: string;
    },
  ) {
    const res = await api.patch(`/api/v1/manifest/${id}/carrier`, payload);

    return unwrap(res);
  },

  async syncDhl(id: string) {
    const res = await api.post(`/api/v1/manifest/${id}/tracking/sync`);

    return unwrap(res);
  },

  async getCarriers(): Promise<Carrier[]> {
    const res = await api.get("/api/v1/carrier");

    return unwrap(res);
  },
};
