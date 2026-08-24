"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface Teacher {
  id: string;
  name: string;
  profilePicture: string;
  designation: string;
}

const BrowseTutors = ({ tutors }: { tutors: Teacher[] }) => {
  return (
    <section
      className="py-16 px-4 bg-white dark:bg-gray-900 text-center  "
      id="team"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto text-center"
      >
        <h2 className="text-4xl font-bold text-blue-800 dark:text-white mb-4">
          শিক্ষক / পরিচালক
        </h2>

        <p className="text-gray-700 dark:text-gray-300 text-lg mb-12">
          আমাদের রয়েছে দক্ষ ও প্রশিক্ষণ প্রাপ্ত শিক্ষক ও মোহতামীম
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tutors.map((teacher, idx) => (
            <div
              key={teacher.id}
              className="bg-blue-50 dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-all"
            >
              <div className="w-28 h-28 mx-auto relative mb-4">
                <Image
                  src={teacher.profilePicture}
                  alt={teacher.name}
                  fill
                  className="rounded-xl object-cover"
                />
              </div>

              <h3 className="text-xl font-semibold text-blue-700 dark:text-white">
                {teacher.name}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {teacher.designation}
              </p>

              <Link href={`/tutors/${teacher.id}`}>
                <Button className="bg-blue-600 text-white px-4 py-4 rounded-xl hover:bg-blue-700 transition mt-6 cursor-pointer  ">
                  বিস্তারিত
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default BrowseTutors;
