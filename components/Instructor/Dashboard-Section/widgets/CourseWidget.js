import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/vidyarishiapi/lib/axios";


const CourseWidget = ({
  data,
  courseStyle,
  showDescription,
  showAuthor,
  isProgress,
  isCompleted,
  isEdit,
}) => {
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [totalReviews, setTotalReviews] = useState("");
  const [rating, setRating] = useState("");

  const progressValue = data.progress ?? data.progressValue ?? 0;

  const getDiscountPercentage = () => {
    if (!data.offerPrice || !data.coursePrice) return;
    const discount = data.coursePrice - data.offerPrice;
    const percentage = (discount / data.coursePrice) * 100;
    setDiscountPercentage(percentage.toFixed(0));
  };

  const getTotalReviews = () => {
    if (!data.reviews) return setTotalReviews(0);

    const r = data.reviews;
    const total =
      (r.oneStar || 0) +
      (r.twoStar || 0) +
      (r.threeStar || 0) +
      (r.fourStar || 0) +
      (r.fiveStar || 0);

    setTotalReviews(total);
  };

  const getRating = () => {
    if (!data.rating?.average) return setRating(0);
    setRating(data.rating.average.toFixed(0));
  };

  useEffect(() => {
    getDiscountPercentage();
    getTotalReviews();
    getRating();
  }, []);

  // API ACTIONS

  const handleBuyCourse = async () => {
    try {
      const res = await api.post("/api/dashboard/student/enroll", {
        courseId: data.id || data.courseId,
        title: data.title,
        description: data.shortDescription,
      });


      alert("Successfully Enrolled!");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

  const handleProgressUpdate = async () => {
    try {
      const newProgress = Math.min(100, progressValue + 10);

      await api.put(`/api/dashboard/student/enrolled-courses/${data._id}`, {
        progress: newProgress,
        status: newProgress === 100 ? "completed" : "active",
      });


      alert("Progress updated!");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Progress update failed");
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm("Remove this course?")) return;

    try {
      await api.delete(`/api/dashboard/student/enrolled-courses/${data._id}`);
      alert("Course removed!");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Remove failed");
    }
  };

  return (
    <div className="rbt-card variation-01 rbt-hover">
      {/* IMAGE */}
      <div className="rbt-card-img">
        <Link href={`/course-details/${data.id || data.courseId}`}>
          <Image
            width={330}
            height={227}
            src={data.courseThumbnail}
            alt={data.title}
          />
          {discountPercentage && (
            <div className="rbt-badge-3 bg-white">
              <span>-{discountPercentage}%</span>
              <span>Off</span>
            </div>
          )}
        </Link>
      </div>

      <div className="rbt-card-body">
        {/* TITLE + RATING */}
        {courseStyle === "two" && (
          <>
            <div className="rbt-card-top">
              <div className="rbt-review">
                <div className="rating">
                  {Array.from({ length: rating }, (_, i) => (
                    <i key={i} className="fas fa-star" />
                  ))}
                </div>
                <span className="rating-count">({totalReviews} Reviews)</span>
              </div>
            </div>

            <h4 className="rbt-card-title">
              <Link href={`/course-details/${data.id || data.courseId}`}>
                {data.title}
              </Link>
            </h4>
          </>
        )}

        {/* META */}
        <ul className="rbt-meta">
          <li>
            <i className="feather-book" /> {data.lectures || 0} Lessons
          </li>
          <li>
            <i className="feather-users" /> {data.enrolledStudent || 0} Students
          </li>
        </ul>

        {/* PROGRESS MODE (ENROLLED COURSES VIEW) */}
        {isProgress ? (
          <>
            <div className="rbt-progress-style-1 mb--20 mt--10">
              <div className="single-progress">
                <h6 className="rbt-title-style-2 mb--10">Progress</h6>

                <div className="progress">
                  <div
                    className="progress-bar bar-color-success"
                    style={{ width: `${progressValue}%` }}
                  ></div>
                  <span className="rbt-title-style-2 progress-number">
                    {progressValue}%
                  </span>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="rbt-card-bottom">
              {progressValue === 100 ? (
                <a
                  className="rbt-btn btn-sm bg-primary-opacity w-100 text-center"
                  href={`/api/dashboard/student/certificate/${data.courseId || data.id}`}
                >
                  Download Certificate
                </a>
              ) : (
                <button
                  className="rbt-btn btn-sm bg-success-opacity w-100 text-center"
                  onClick={handleProgressUpdate}
                >
                  +10% Progress
                </button>
              )}

              <button
                className="rbt-btn btn-sm bg-danger-opacity w-100 text-center mt-2"
                onClick={handleDeleteCourse}
              >
                Remove Course
              </button>
            </div>
          </>
        ) : (
          /* COURSE CARD MODE (CATALOG VIEW) */
          <div className="rbt-card-bottom">
            <div className="rbt-price">
              <span className="current-price">${data.offerPrice}</span>
              <span className="off-price">${data.coursePrice}</span>
            </div>

            {!isEdit ? (
              <button className="rbt-btn-link" onClick={handleBuyCourse}>
                Buy Course <i className="feather-arrow-right" />
              </button>
            ) : (
              <Link className="rbt-btn-link left-icon" href="#">
                <i className="feather-edit"></i> Edit
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseWidget;