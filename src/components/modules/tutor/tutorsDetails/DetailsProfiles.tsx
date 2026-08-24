"use client";

import { CalendarDays, Mail, PhoneCall, UserRound } from "lucide-react";
import Image from "next/image";

// ------------------ TYPES ------------------
export interface Address {
  village?: string;
  postOffice?: string;
  thana?: string;
  district?: string;
  division?: string;
}

export interface Tutor {
  id: string;
  name: string;
  designation?: string;
  profilePicture: string;
  joinDate?: string;
  dateOfBirth?: string;
  fatherName?: string;
  motherName?: string;
  phone?: string;
  NIDNO?: string;
  email?: string;
  qualification?: string;
  jimmadarClass?: string;
  presentAddress?: Address;
  permanentAddress?: Address;
}

// ------------------ MAIN COMPONENT ------------------
const DetailsProfiles = ({ tutor }: { tutor: Tutor }) => {
  if (!tutor) return <p>Tutor not found!</p>;
  console.log("tutor from id", tutor);
  return (
    <div className="max-w-6xl mx-auto p-6  ">
      {/* TOP SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* LEFT — PROFILE IMAGE */}
        <div className="flex flex-col items-center">
          <Image
            src={tutor.profilePicture}
            alt={tutor.name}
            width={350}
            height={400}
            className="rounded-xl shadow-md object-cover"
          />

          {/* Social Share (Optional) */}
          <p className="mt-3 text-gray-500 italic">Share Profile</p>
          <div className="flex gap-3 mt-2">
            <div className="p-2 bg-blue-600 text-white rounded-lg cursor-pointer">
              F
            </div>
            <div className="p-2 bg-black text-white rounded-lg cursor-pointer">
              X
            </div>
            <div className="p-2 bg-blue-900 text-white rounded-lg cursor-pointer">
              In
            </div>
            <div className="p-2 bg-green-600 text-white rounded-lg cursor-pointer">
              WA
            </div>
          </div>
        </div>

        {/* RIGHT — TEXT INFO */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-blue-800 uppercase">
            {tutor.name}
          </h1>
          <p className="text-gray-600 text-lg mt-3">
            পদবীঃ {tutor.designation}
          </p>

          {/* INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <InfoBox title="Joining Date" value={formatDate(tutor.joinDate)} />
            <InfoBox title="Birth Date" value={formatDate(tutor.dateOfBirth)} />
            <InfoBox title="Father's Name" value={tutor.fatherName} />
            <InfoBox title="Mother's Name" value={tutor.motherName} />
            <InfoBox title="Contact No." value={tutor.phone} />
            <InfoBox title="National ID" value={tutor.NIDNO} />
            <InfoBox title="Email" value={tutor.email} />
            <InfoBox title="Qualification" value={tutor.qualification} />
            <InfoBox title="Jimmadar" value={tutor.jimmadarClass} />
          </div>

          {/* ADDRESSES */}

          <div className="mt-6">
            <AddressBox title="Present Address" addr={tutor.presentAddress} />
            <AddressBox
              title="Permanent Address"
              addr={tutor.permanentAddress}
            />
          </div>
        </div>
      </div>

      {/* FOOTER SOCIAL LINKS */}
      <div className="mt-12 bg-blue-900 py-6 flex justify-center gap-6 text-white rounded-lg">
        <div className="p-2 bg-blue-800 rounded-full">
          <Mail />
        </div>
        <div className="p-2 bg-blue-800 rounded-full">
          <PhoneCall />
        </div>
        <div className="p-2 bg-blue-800 rounded-full">
          <CalendarDays />
        </div>
        <div className="p-2 bg-blue-800 rounded-full">
          <UserRound />
        </div>
      </div>
    </div>
  );
};

// ------------------ INFO BOX COMPONENT ------------------
interface InfoBoxProps {
  title: string;
  value?: string | number | null;
}

const InfoBox = ({ title, value }: InfoBoxProps) => (
  <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
    <p className="text-gray-500 text-sm">{title}</p>
    <p className="font-bold text-gray-800">{value || "-"}</p>
  </div>
);

// ------------------ ADDRESS BOX COMPONENT ------------------
interface AddressBoxProps {
  title: string;
  addr?: Address;
}

const AddressBox = ({ title, addr }: AddressBoxProps) => (
  <div className="bg-gray-100 p-4 my-3 rounded-lg shadow-sm">
    <h2 className="font-semibold text-gray-700">{title}</h2>
    <p className="text-gray-600 mt-1">
      {addr
        ? `${addr.village || ""}, ${addr.postOffice || ""}, ${addr.thana || ""}, ${addr.district || ""}, ${addr.division || ""}`
        : "-"}
    </p>
  </div>
);

// ------------------ DATE FORMAT FUNCTION ------------------
const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default DetailsProfiles;
