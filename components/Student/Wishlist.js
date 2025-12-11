import { useEffect, useState } from "react";
import CourseWidget from "../Instructor/Dashboard-Section/widgets/CourseWidget";
import api from "@/vidyarishiapi/lib/axios";

const Wishlist = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get("/api/dashboard/wishlist");
        setCourses(res.data?.data || []);
      } catch (error) {
        console.error("Wishlist fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeFromUI = (courseId) => {
    setCourses(prev => prev.filter(c => c.courseId !== courseId));
  };


  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
      <div className="content">
        <div className="section-title">
          <h4 className="rbt-title-style-3">Wishlist</h4>
        </div>

        {loading && <p>Loading wishlist...</p>}

        {!loading && courses.length === 0 && (
          <p>No courses in your wishlist yet.</p>
        )}

        <div className="row g-5">
          {courses.map((course) => (
            <div
              className="col-lg-4 col-md-6 col-12"
              key={`wishlist-${course.courseId}`}
            >
              <CourseWidget
                data={course}
                courseStyle="two"
                isCompleted={false}
                isProgress={false}
                showDescription={false}
                showAuthor={false}
                isEdit={false}
                onRemove={removeFromUI}
              />

              {/* <button
                className="rbt-btn btn-border radius-round mt-2"
                onClick={() => removeFromWishlist(course.courseId)}
              >
                Remove from wishlist
              </button> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;