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
  onRemove,                // optional (Wishlist page)
  onProgressUpdated,       // NEW → Callback for progress update
}) => {

  const [discountPercentage, setDiscountPercentage] = useState("");
  const [totalReviews, setTotalReviews] = useState("");
  const [rating, setRating] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);

  // LOCAL progress state (so UI updates instantly)
  const [progressValue, setProgressValue] = useState(
    data.progress ?? data.progressValue ?? 0
  );

  // DISCOUNT / REVIEWS / RATING 
  useEffect(() => {
    if (data.offerPrice && data.coursePrice) {
      const discount = data.coursePrice - data.offerPrice;
      const percentage = (discount / data.coursePrice) * 100;
      setDiscountPercentage(percentage.toFixed(0));
    }

    if (data.reviews) {
      const r = data.reviews;
      const total =
        (r.oneStar || 0) +
        (r.twoStar || 0) +
        (r.threeStar || 0) +
        (r.fourStar || 0) +
        (r.fiveStar || 0);
      setTotalReviews(total);
    }

    if (data.rating?.average) {
      setRating(data.rating.average.toFixed(0));
    }
  }, []);

  //  WISHLIST SYNC 
  useEffect(() => {
    if (data.isWishlisted || data.fromWishlist) {
      setIsWishlisted(true);
    }
  }, [data]);

  //  WISHLIST TOGGLE
  const toggleWishlist = async () => {
    const courseId = data.id || data.courseId;

    try {
      if (isWishlisted) {
        // Remove from wishlist
        await api.delete("/api/dashboard/wishlist", {
          data: { courseId },
        });

        setIsWishlisted(false);

        // Auto-remove from Wishlist UI
        if (onRemove) onRemove(courseId);

      } else {
        // Add to wishlist
        await api.post("/api/dashboard/wishlist", {
          courseId,
          title: data.title,
          description: data.description || "",
          meta: {
            thumbnail: data.courseThumbnail,
            price: data.offerPrice,
          }
        });

        setIsWishlisted(true);
      }

    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    }
  };

  //  PROGRESS UPDATE (NO RELOAD 🔥) 
  const handleProgressUpdate = async () => {
    try {
      const newProgress = Math.min(100, progressValue + 10);

      const response = await api.put(
        `/api/dashboard/student/enrolled-courses/${data._id}`,
        {
          progress: newProgress,
          status: newProgress === 100 ? "completed" : "active",
        }
      );

      // Update UI instantly
      setProgressValue(response.data.progress);

      // Notify parent to re-fetch courses
      if (onProgressUpdated) onProgressUpdated();

      alert("Progress updated!");

    } catch (err) {
      alert(err.response?.data?.message || "Progress update failed");
    }
  };


  //  UI START 
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

          {/* DISCOUNT BADGE */}
          {discountPercentage && (
            <div className="rbt-badge-3 bg-white">
              <span>-{discountPercentage}%</span>
              <span>Off</span>
            </div>
          )}
        </Link>
      </div>

      <div className="rbt-card-body">

        {/* TOP SECTION */}
        {courseStyle === "two" && (
          <>
            <div className="rbt-card-top">

              {/* Rating */}
              <div className="rbt-review">
                <div className="rating">
                  {Array.from({ length: rating }, (_, i) => (
                    <i className="fas fa-star" key={i} />
                  ))}
                </div>
                <span className="rating-count">({totalReviews} Reviews)</span>
              </div>

              {/* BOOKMARK BUTTON */}
              <div className="rbt-bookmark-btn">
                <button
                  className="rbt-round-btn"
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  onClick={toggleWishlist}
                >
                  {isWishlisted ? (
                    <i className="fas fa-bookmark" /> // filled
                  ) : (
                    <i className="feather-bookmark" /> // outline
                  )}
                </button>
              </div>
            </div>

            <h4 className="rbt-card-title">
              <Link href={`/course-details/${data.id || data.courseId}`}>
                {data.title}
              </Link>
            </h4>
          </>
        )}

        {/* META INFO */}
        <ul className="rbt-meta">
          <li>
            <i className="feather-book" /> {data.lectures || 0} Lessons
          </li>
          <li>
            <i className="feather-users" /> {data.enrolledStudent || 0} Students
          </li>
        </ul>


        {/* PROGRESS AREA */}
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

            {/* COMPLETED → CERTIFICATE BUTTON */}
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
                  type="button"
                >
                  +10% Progress
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="rbt-card-bottom">
            <div className="rbt-price">
              <span className="current-price">${data.offerPrice}</span>
              <span className="off-price">${data.coursePrice}</span>
            </div>

            <Link className="rbt-btn-link" href="#">
              Learn More <i className="feather-arrow-right" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default CourseWidget;
