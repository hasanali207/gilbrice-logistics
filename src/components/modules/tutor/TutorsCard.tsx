"use client";

import { MapPin, ScanEye } from "lucide-react";
import React from "react";
import img from "../../../../public/tutor.jpg";

import Link from "next/link";
import { IUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const TutorsCard = ({ tutor }: { tutor: IUser }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-700 relative overflow-hidden hover:shadow-lg  group rounded-xl p-5 transition-all duration-500 transform mb-6">
      <div className=" flex flex-col lg:flex-row justify-between gap-6 ">

        <div className=" lg:w-1/4">
          <Image
            src={tutor?.image || img}
            alt={tutor?.name || "Tutor"}
            height={400}
            width={400}
            className="rounded object-cover border-2 border-gray-300 dark:border-gray-600"
          />
      
        </div>

        <div className="lg:w-2/4">
          <h1 className="text-gray-600 text-xl uppercase dark:text-gray-200 font-bold">
            {tutor?.name}
          </h1>
          <div className="flex items-center text-black gap-2 text-sm">
            <MapPin size={15} color="#f72b2b" />{" "}
            {tutor?.address ? tutor.address.split(",").pop()?.trim() : "N/A"}
          </div>

          <p className="text-gray-500 text-sm mt-2 dark:text-gray-300">
            Hi!! I am <span className="font-bold">{tutor?.name}</span> I have
            many years of experience tutoring{" "}
            {tutor?.subjects?.split(",").map((subject, index) => (
              <span key={index} className="font-bold">
                {index > 0 ? " and " : ""}{subject}
              </span>
            ))}
            , a subject I’m truly passionate about. My strong foundation in
            subjects, combined with my near-completed Master’s degree in M.S.C,
            equips me to effectively guide students through challenging concepts
            with clarity and confidence.
          </p>
        </div>

        <div className="lg:w-1/4 space-y-2 flex flex-col justify-center items-center text-center">
          <p>
            {" "}
            <span className="text-sm font-bold">
              ⭐⭐⭐⭐⭐ {tutor?.averageRating?.toFixed(1)}
            </span>
          </p>
          {tutor?.subjects?.split(",").map((subject, index) => (
            <span
              key={index}
              className="rounded-full bg-[#dae6f3] px-5 py-1 text-sm font-semibold text-[#066ccb]"
            >
              {subject.trim()}
            </span>
          ))}
          <p>${tutor?.price}/hr</p>
          <div
            className=" group-hover:bottom-1 -bottom-16 transition-all duration-500 bg-gray-600 dark:bg-gray-100 mt-3 right-35
         rounded-lg"
          >
            <Link href={`/tutors/${tutor?.id}`}>
              {" "}
              <Button
                variant="outline"
               className="bg-blue-600 text-base text-white  hover:text-blue-600 border-blue-600 flex items-center gap-2 "
              >
                <ScanEye />
                Veiw Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorsCard;
