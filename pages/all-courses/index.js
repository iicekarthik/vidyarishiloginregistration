"use client";
import PageHead from "../Head";
import HeaderStyleTen from "@/components/Header/HeaderStyle-Ten";
import Separator from "@/components/Common/Separator";
import MobileMenu from "@/components/Header/MobileMenu";
import FooterThree from "@/components/Footer/Footer-Three";
import CategoryHeadTwo from "@/components/Category/CategoryHeadTwo";
import CourseFilterOneToggle from "@/components/Category/Filter/CourseFilterOneToggle";
import Pagination from "@/components/Common/Pagination";

import Context from "@/context/Context";
import { Provider } from "react-redux";
import Store from "@/redux/store";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import University from "@/data/vidya/University.json";

// Normalize string helper
const normalizeString = (str) =>
  typeof str === "string" ? str.toLowerCase().trim() : "";

const Home = () => {
  const router = useRouter();

  const [QueryData, setQueryData] = useState({});
  const [Loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    university: [],
    FilCourse: "",
    specialization: "",
    mode: "",
    level: "",
    price: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const itemsPerPage = 6;

  const queryKeyMap = {
    FilCourse: "shortName",
    mode: "course_type",
    level: "degree_type",
    university: "university",
  };

  // --------------------- HANDLERS ---------------------
  const handleClick = (num) => {
    setPage(num);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);

    // Update URL
    const newQuery = { ...router.query };

    if (key === "university") {
      const q = value.length > 0 ? value.join(",") : undefined;
      if (q) newQuery.university = q;
      else delete newQuery.university;
    } else {
      const q = value || undefined;
      const queryKey = queryKeyMap[key] || key;
      if (q) newQuery[queryKey] = q;
      else delete newQuery[queryKey];
    }

    router.replace({ pathname: "/all-courses", query: newQuery }, undefined, {
      shallow: true,
    });
  };

  // --------------------- APPLY FILTERS ---------------------
  const applyAllFilters = (courseList) => {
    const query = normalizeString(searchQuery);

    return courseList
      .map((course) => {
        // Filter the specializations first if a specialization filter is applied
        let filteredSpecs = course.specializations?.specializationList || [];

        if (filters.specialization) {
          filteredSpecs = filteredSpecs.filter(
            (spec) =>
              normalizeString(spec.specialization_name) ===
              normalizeString(filters.specialization)
          );
        }

        // If the course has no specialization left after filter, ignore it
        if (filters.specialization && filteredSpecs.length === 0) return null;

        // Check other course-level filters
        const matchesSearch =
          !query ||
          normalizeString(course.course_name).includes(query) ||
          normalizeString(course.shortName).includes(query) ||
          normalizeString(course.shortName2).includes(query) ||
          normalizeString(course.universityDetails?.title).includes(query);

        const matchesUniversity =
          !filters.university.length ||
          filters.university.some(
            (uni) =>
              normalizeString(course.universityDetails?.title) ===
              normalizeString(uni)
          );

        const matchesCourse =
          !filters.FilCourse ||
          normalizeString(course.shortName) ===
          normalizeString(filters.FilCourse);

        const matchesMode =
          !filters.mode ||
          normalizeString(course.universityDetails?.mode) ===
          normalizeString(filters.mode);

        const matchesLevel =
          !filters.level ||
          normalizeString(course.degree_type) ===
          normalizeString(filters.level);

        if (
          matchesSearch &&
          matchesUniversity &&
          matchesCourse &&
          matchesMode &&
          matchesLevel
        ) {
          return {
            ...course,
            specializations: {
              ...course.specializations,
              specializationList: filteredSpecs,
            },
          };
        }
        return null;
      })
      .filter(Boolean); // remove nulls
  };

  // --------------------- FETCH COURSES ---------------------
  useEffect(() => {
    setLoading(true);

    const universities = University?.AllUniversities || [];

    const allCourses = universities
      .flatMap((university) =>
        university.courses
          .filter(
            (course) =>
              Array.isArray(course.overviewTableDetails) &&
              course.overviewTableDetails.length > 0 &&
              course.keyoverview &&
              Object.keys(course.keyoverview).length > 0 &&
              course.eligibilityDuration &&
              Object.keys(course.eligibilityDuration).length > 0 &&
              course.admissionProcess &&
              Object.keys(course.admissionProcess).length > 0 &&
              typeof course.course_name === "string" &&
              course.course_name.trim() !== ""
          )
          .map((course) => ({
            ...course,
            universityDetails: university,
          }))
      )
      .sort((a, b) =>
        a.universityDetails?.title.localeCompare(b.universityDetails?.title)
      );

    setCourses(allCourses);
    setLoading(false);
  }, []);

  // --------------------- UPDATE FILTERS FROM URL ---------------------
  useEffect(() => {
    if (!router.isReady || courses.length === 0) return;

    const { degree_type, shortName, university, specialization } = router.query;
    const updatedFilters = { ...filters };

    if (degree_type) updatedFilters.level = normalizeString(degree_type);
    if (shortName) updatedFilters.FilCourse = normalizeString(shortName);

    if (university) {
      updatedFilters.university = Array.isArray(university)
        ? university.map((u) => normalizeString(u))
        : university.split(",").map((u) => normalizeString(u));
    }

    if (specialization) {
      updatedFilters.specialization = normalizeString(specialization);
    }

    setFilters(updatedFilters);
    setQueryData(router.query);
  }, [router.isReady, router.query, courses]);

  // --------------------- FLATTEN SPECIALIZATIONS ---------------------
  const flattenedSpecializations = useMemo(() => {
    const filteredCourses = applyAllFilters(courses);

    return filteredCourses.flatMap((course) => {
      if (course.specializations?.specializationList?.length) {
        return course.specializations.specializationList.map((spec) => ({
          ...spec,
          courseData: course,
        }));
      } else {
        return [{ courseData: course }];
      }
    });
  }, [courses, filters, searchQuery]);

  // --------------------- PAGINATION ---------------------
  const getSelectedSpecializations = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return flattenedSpecializations.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [flattenedSpecializations, page]);

  useEffect(() => {
    setTotalPages(Math.ceil(flattenedSpecializations.length / itemsPerPage));
  }, [flattenedSpecializations]);

  // --------------------- RENDER ---------------------

  return (
    <>
      <PageHead
        title="Online Courses in India – UGC-Approved Distance & Online Programs | Vidyarishi"
        description="Explore Vidyarishi's curated list of UGC-approved online and distance learning courses across UG, PG, diploma, and certificate levels. Study at your convenience and elevate your future with flexible education."
        keywords="online courses India, UGC approved programs, distance education, Vidyarishi courses, online degrees, undergraduate and postgraduate courses, flexible learning, online diplomas, certificate programs India"
        image="/images/vidya/logo/VR_logo2.png"
        url="https://vidyarishi.com/all-courses"

        canonical="https://vidyarishi.com/all-courses"
        author="Vidyarishi"
        publisher="Vidyarishi"
        ogSiteName="Vidyarishi"
        ogLocale="en_IN"
        twitterSite="@vidyarishi"
        twitterCreator="@vidyarishi"

        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Online Courses in India – Vidyarishi",
          description:
            "Curated list of UGC-approved online and distance programs across UG, PG, diploma, and certificate levels.",
          publisher: {
            "@type": "Organization",
            name: "Vidyarishi",
            logo: {
              "@type": "ImageObject",
              url: "https://vidyarishi.com/images/vidya/logo/VR_logo2.png"
            }
          }
        }}
      />

      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleTen headerSticky="rbt-sticky" headerType="" />

          <CategoryHeadTwo
            filters={filters}
            onFilterChange={handleFilterChange}
            universities={University?.AllUniversities}
            searchQuery={searchQuery}
            handleSearch={handleSearch}
            category={getSelectedSpecializations}
            QueryData={QueryData}
          />

          <div
            style={{ marginTop: "40px" }}
            className="rbt-section-overlayping-top rbt-section-gapBottom"
          >
            <div className="inner">
              <div className="container">
                <CourseFilterOneToggle
                  Loading={Loading}
                  course={getSelectedSpecializations}
                />

                {flattenedSpecializations.length > itemsPerPage && (
                  <div className="row">
                    <div className=" mt--60 ">
                      <Pagination
                        totalPages={totalPages}
                        pageNumber={page}
                        handleClick={handleClick}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />
          <FooterThree />
        </Context>
      </Provider>
    </>
  );
};

export default Home;
