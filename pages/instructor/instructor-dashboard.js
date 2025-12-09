import React from "react";
import PageHead from "../Head";
import HeaderStyleTen from "@/components/Header/HeaderStyle-Ten";
import MobileMenu from "@/components/Header/MobileMenu";
import InstructorLayout from "@/components/Layouts/InstructorLayout";

export default function InstructorDashboard() {
  return (
    <>
      <PageHead
        title="Instructor Dashboard – Vidyarishi | Teach Anytime, Anywhere"
        description="Access the Vidyarishi Instructor Dashboard to manage courses, track student performance, upload learning materials, and streamline your teaching experience."
        keywords="instructor dashboard, Vidyarishi instructor portal, teacher tools, online teaching India, educator login, instructor course management, e-learning platform"
        image="/images/vidya/logo/VR_logo2.png"
        url="https://vidyarishi.com/instructor-dashboard"
      />


      <MobileMenu />
      <HeaderStyleTen headerSticky="rbt-sticky" headerType="" />

      <div className="container pt--60 pb--60">
        <InstructorLayout>
          <h2>Instructor Dashboard</h2>
        </InstructorLayout>
      </div>
    </>
  );
}