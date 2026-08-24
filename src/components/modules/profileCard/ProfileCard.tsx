"use client";

import api from "@/lib/axios";
import { useAppSelector } from "@/Redux/hook";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Profile {
  id: string;
  username: string;
  profilePicture?: string;
  name: string;
  email: string;
  role: "CLIENT" | "ADMIN" | "SUPER_ADMIN";
  client?: any;
  admin?: any;
  superadmin?: any;
}

const ProfileCard = () => {
  const authUser = useAppSelector((state) => state.auth.user);

  const token = useAppSelector((state) => state.auth.token);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.email || !token) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `${process.env.NEXT_PUBLIC_BASE_API}/api/v1/user/${authUser.email}`,
        );

        if (!res.data?.success) {
          toast.error("Failed to load profile");
          setProfile(null);
        } else {
          setProfile(res?.data?.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch profile");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser?.email, token]);

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>No profile data found.</p>;

  // Determine which profile data to show
  const userProfile = profile;

  if (!userProfile) return <p>No profile details available.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6   rounded-2xl  dark:border-zinc-700  ">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
        {/* Profile Picture */}
        <div className="flex-shrink-0 flex flex-col space-y-3 text-center">
          <Image
            src={userProfile.profilePicture || "/default-avatar.png"}
            alt="Profile"
            width={112}
            height={112}
            className="w-32 h-32 rounded-xl object-cover border-2 border-blue-500 mx-auto"
          />

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {userProfile.name}
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-500">
            Email: {userProfile.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
