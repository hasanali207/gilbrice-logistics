import BannerSection from "@/components/AboutPage/BannerSection";
import MissionSection from "@/components/AboutPage/MissionSection";
import WorkingSection from "@/components/AboutPage/WorkingSection";
import TeamSection from "@/components/AboutPage/TeamSection";
import ReviewSection from "@/components/AboutPage/ReviewSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TutorLink | About",
  description: "TutorLink helps you to find Best tutors",
};

const AboutPage = () => {
  return (
    <div className="">
      <MissionSection />
      <BannerSection />
      <WorkingSection />
      <TeamSection />
      <ReviewSection />
    </div>
  );
};

export default AboutPage;
