
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SidebarData from "@/data/dashboard/student/student-sidebar.json";
import axios from "axios";
import { getAuthToken } from "@/vidyarishiapi/utils/authapi";

const StudentDashboardSidebar = () => {
  const router = useRouter();
  const path = router.pathname;
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const res = await axios.get("/api/dashboard/profileroute", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudentName(res.data.fullName || "User");
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <div className="rbt-default-sidebar sticky-top rbt-shadow-box rbt-gradient-border">
        <div className="inner">
          <div className="content-item-content">
            <div className="rbt-default-sidebar-wrapper">
              <div className="section-title mb--20">
                <h6 className="rbt-title-style-2">Welcome, {studentName}</h6>
              </div>
              <nav className="mainmenu-nav">
                <ul className="dashboard-mainmenu rbt-default-sidebar-list">
                  {SidebarData &&
                    SidebarData.siderbar.slice(0, 7).map((data, index) => (
                      <li className="nav-item" key={index} role="presentation">
                        <a
                          className={`${path === data.link ? "active" : ""}`}
                          href={data.link}
                        >
                          <i className={data.icon} />
                          <span>{data.text}</span>
                        </a>
                      </li>
                    ))}
                </ul>
              </nav>

              <div className="section-title mt--40 mb--20">
                <h6 className="rbt-title-style-2">User</h6>
              </div>

              <nav className="mainmenu-nav">
                <ul className="dashboard-mainmenu rbt-default-sidebar-list">
                  {SidebarData &&
                    SidebarData.siderbar.slice(7, 10).map((data, index) => (
                      <li key={index}>
                        <a
                          href={data.link}
                          className={`${path === data.link ? "active" : ""}`}
                        >
                          <i className={data.icon} />
                          <span>{data.text}</span>
                        </a>
                      </li>
                    ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboardSidebar;
