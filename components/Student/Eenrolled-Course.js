import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/vidyarishiapi/lib/axios";
import CourseWidget from "../Instructor/Dashboard-Section/widgets/CourseWidget";

const EnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/dashboard/student/enrolled-courses");

      if (Array.isArray(res.data)) {
        setCourses(res.data);
      } else {
        setCourses([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const enrolled = courses.filter((c) => c.status === "enrolled");
  const active = courses.filter((c) => c.status === "active");
  const completed = courses.filter((c) => c.status === "completed");

  return (
    <>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Enrolled Courses</h4>
          </div>

          {/* TABS */}
          <div className="advance-tab-button mb--30">
            <ul
              className="nav nav-tabs tab-button-style-2 justify-content-start"
              role="tablist"
            >
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button active"
                  data-bs-toggle="tab"
                  data-bs-target="#enrolled"
                >
                  <span className="title">Enrolled Courses</span>
                </Link>
              </li>

              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  data-bs-toggle="tab"
                  data-bs-target="#active"
                >
                  <span className="title">Active Courses</span>
                </Link>
              </li>

              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  data-bs-toggle="tab"
                  data-bs-target="#completed"
                >
                  <span className="title">Completed Courses</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* TAB CONTENT */}
          <div className="tab-content">
            {/* ENROLLED */}
            <div className="tab-pane fade active show" id="enrolled">
              <div className="row g-5">
                {enrolled.length === 0 && <p>No enrolled courses yet.</p>}
                {enrolled.map((course, i) => (
                  <div key={i} className="col-lg-4 col-md-6 col-12">
                    <CourseWidget
                      data={course}
                      courseStyle="two"
                      isProgress={true}
                      isCompleted={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIVE */}
            <div className="tab-pane fade" id="active">
              <div className="row g-5">
                {active.length === 0 && <p>No active courses.</p>}
                {active.map((course, i) => (
                  <div key={i} className="col-lg-4 col-md-6 col-12">
                    <CourseWidget
                      data={course}
                      courseStyle="two"
                      isProgress={true}
                      isCompleted={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* COMPLETED */}
            <div className="tab-pane fade" id="completed">
              <div className="row g-5">
                {completed.length === 0 && <p>No completed courses.</p>}
                {completed.map((course, i) => (
                  <div key={i} className="col-lg-4 col-md-6 col-12">
                    <CourseWidget
                      data={course}
                      courseStyle="two"
                      isProgress={true}
                      isCompleted={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnrolledCourses;
