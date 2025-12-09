import Separator from "@/components/Common/Separator";
import FooterOne from "@/components/Footer/Footer-One";
import HeaderStyleTen from "@/components/Header/HeaderStyle-Ten";
import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import Profile from "@/components/Student/Profile";
import StudentDashboardHeader from "@/components/Student/StudentDashboardHeader";
import StudentDashboardSidebar from "@/components/Student/StudentDashboardSidebar";
import Context from "@/context/Context";
import PageHead from "@/pages/Head";
import BackToTop from "@/pages/backToTop";
import Store from "@/redux/store";
import { Provider } from "react-redux";
import { useEffect, useState } from "react";
import { refreshTokenAPI } from "@/vidyarishiapi/utils/authapi";

const StudentProfile = () => {

  const [user, setUser] = useState(null);
  
useEffect(() => {
  const fetchProfile = async () => {
    try {
      let accessToken = localStorage.getItem("vr_access_token");
      const refreshToken = localStorage.getItem("vr_refresh_token");

      // If no access token but we have refresh token → try refresh first
      if (!accessToken && refreshToken) {
        const refreshRes = await refreshTokenAPI();
        if (refreshRes?.accessToken) {
          accessToken = refreshRes.accessToken;
        }
      }

      if (!accessToken) {
        console.error("No valid access token found (and refresh failed).");
        return;
      }

      // 1st attempt
      let res = await fetch("/api/dashboard/profileroute", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // If token expired / invalid → try refresh once and retry profile
      if (res.status === 401 && refreshToken) {
        const refreshRes = await refreshTokenAPI();

        if (refreshRes?.accessToken) {
          accessToken = refreshRes.accessToken;

          // retry profile with new access token
          res = await fetch("/api/dashboard/profileroute", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
        }
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to fetch profile");
      }

      setUser(data);
    } catch (err) {
      console.error("Profile fetch error:", err.message);
    }
  };

  fetchProfile();
}, []);

  return (
    <>
      <PageHead title="Student Profile - Online Courses & Education NEXTJS14 Template" />

      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleTen headerSticky="rbt-sticky" headerType="" />
          <Cart />

          <div className="rbt-page-banner-wrapper">
            <div className="rbt-banner-image" />
          </div>
          <div className="rbt-dashboard-area rbt-section-overlayping-top rbt-section-gapBottom">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <StudentDashboardHeader />

                  <div className="row g-5">
                    <div className="col-lg-3">
                      <StudentDashboardSidebar />
                    </div>

                    <div className="col-lg-9">
                     <Profile user={user} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <BackToTop />
          <Separator />
          <FooterOne />
        </Context>
      </Provider>
    </>
  );
};

export default StudentProfile;
