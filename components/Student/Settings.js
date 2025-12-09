"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAuthToken } from "@/vidyarishiapi/utils/authapi";


const Setting = () => {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    twitter: "",
    linkedin: "",
    website: "",
    github: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/dashboard/profileroute", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error(data.message || data.error || "Failed to fetch user");
          setLoading(false);
          return;
        }

        // Fix: properly restore all values including skill
        setUser({
          ...data,
          skill: data.skill || "",
          biography: data.biography || "",
        });

        setBio(data.biography || "");

        setSocialLinks({
          facebook: data.facebook || "",
          twitter: data.twitter || "",
          linkedin: data.linkedin || "",
          website: data.website || "",
          github: data.github || "",
        });
      } catch (err) {
        console.error("Fetch user error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Update profile (name, phone, bio, skill)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return alert("Login required");
    if (!user) return;

    const [firstName = "", lastName = ""] = (user.fullName || "").split(" ");

    try {
      const res = await fetch("/api/dashboard/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
        firstName,
        lastName,
        phone: user.phone,
        skill: user.skill,
        biography: bio,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setUser({
          ...data.user,
          skill: data.user.skill || "",
          biography: data.user.biography || "",
        });

        setBio(data.user.biography || "");

        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  // Update social links (reuse same endpoint)
  const handleUpdateSocial = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return alert("Login required");

    try {
      const res = await fetch("/api/dashboard/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(socialLinks),
      });

      const data = await res.json();

      if (data.status === "success") {
        alert("Social links updated successfully!");
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user)
    return <p className="rbt-dashboard-content bg-color-white rbt-shadow-box p-3">Please login to edit settings.</p>;

  const [firstName = "", lastName = ""] = (user.fullName || "").split(" ");

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
      <div className="content">
        <div className="section-title">
          <h4 className="rbt-title-style-3">Settings</h4>
        </div>

        {/* ---- Tabs ---- */}
        <div className="advance-tab-button mb--30">
          <ul
            className="nav nav-tabs tab-button-style-2 justify-content-start"
            id="settinsTab-4"
            role="tablist"
          >
            <li role="presentation">
              <Link
                href="#"
                className="tab-button active"
                id="profile-tab"
                data-bs-toggle="tab"
                data-bs-target="#profile"
                role="tab"
                aria-controls="profile"
                aria-selected="true"
              >
                <span className="title">Profile</span>
              </Link>
            </li>

            <li role="presentation">
              <Link
                href="#"
                className="tab-button"
                id="social-tab"
                data-bs-toggle="tab"
                data-bs-target="#social"
                role="tab"
                aria-controls="social"
                aria-selected="false"
              >
                <span className="title">Social Share</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="tab-content">
          {/* PROFILE TAB */}
          <div
            className="tab-pane fade active show"
            id="profile"
            role="tabpanel"
            aria-labelledby="profile-tab"
          >
            {/* Cover & Avatar block (like your design) */}
            <div className="rbt-dashboard-content-wrapper">
              <div className="tutor-bg-photo bg_image bg_image--23 height-245"></div>
              <div className="rbt-tutor-information">
                <div className="rbt-tutor-information-left">
                  <div className="thumbnail rbt-avatars size-lg position-relative">
                    <Image
                      width={200} //300
                      height={150} //300
                      src="/images/team/avatar-2.jpg"
                      alt="Instructor"
                    />
                    <div className="rbt-edit-photo-inner">
                      <button className="rbt-edit-photo" title="Upload Photo" type="button">
                        <i className="feather-camera" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="rbt-tutor-information-right">
                  <div className="tutor-btn">
                    <Link
                      className="rbt-btn btn-sm btn-border color-white radius-round-10"
                      href="#"
                    >
                      Edit Cover Photo
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile form */}
            <form
              className="rbt-profile-row rbt-default-form row row--15"
              onSubmit={handleUpdateProfile}
            >
              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="rbt-form-group">
                  <label htmlFor="firstname">First Name</label>
                  <input
                    id="firstname"
                    type="text"
                    value={firstName}
                    onChange={(e) =>
                      setUser((prev) => ({
                        ...prev,
                        fullName: `${e.target.value} ${lastName}`.trim(),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="rbt-form-group">
                  <label htmlFor="lastname">Last Name</label>
                  <input
                    id="lastname"
                    type="text"
                    value={lastName}
                    onChange={(e) =>
                      setUser((prev) => ({
                        ...prev,
                        fullName: `${firstName} ${e.target.value}`.trim(),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="rbt-form-group">
                  <label htmlFor="username">User Name</label>
                  <input
                    id="username"
                    type="text"
                    value={user.username || ""}
                    onChange={(e) =>
                      setUser((prev) => ({ ...prev, username: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="rbt-form-group">
                  <label htmlFor="phonenumber">Phone Number</label>
                  <input
                    id="phonenumber"
                    type="tel"
                    value={user.phone || ""}
                    onChange={(e) =>
                      setUser((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="rbt-form-group">
                  <label htmlFor="skill">Skill/Occupation</label>
                  <input
                    id="skill"
                    type="text"
                    value={user?.skill ?? ""}
                    onChange={(e) =>
                      setUser((prev) => ({
                        ...prev,
                        skill: e.target.value,
                      }))
                    }
                  />

                </div>
              </div>

              <div className="col-12">
                <div className="rbt-form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    cols={20}
                    rows={5}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-12 mt--20">
                <div className="rbt-form-group">
                  <button type="submit" className="rbt-btn btn-gradient">
                    Update Info
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* SOCIAL TAB */}
          <div
            className="tab-pane fade"
            id="social"
            role="tabpanel"
            aria-labelledby="social-tab"
          >
            <form
              className="rbt-profile-row rbt-default-form row row--15"
              onSubmit={handleUpdateSocial}
            >
              {["facebook", "twitter", "linkedin", "website", "github"].map((key) => (
                <div className="col-12" key={key}>
                  <div className="rbt-form-group">
                    <label htmlFor={key}>
                      {key === "facebook" && <i className="feather-facebook"></i>}
                      {key === "twitter" && <i className="feather-twitter"></i>}
                      {key === "linkedin" && <i className="feather-linkedin"></i>}
                      {key === "website" && <i className="feather-globe"></i>}
                      {key === "github" && <i className="feather-github"></i>}{" "}
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <input
                      id={key}
                      type="text"
                      placeholder={`https://${key}.com/`}
                      value={socialLinks[key]}
                      onChange={(e) =>
                        setSocialLinks((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              ))}

              <div className="col-12 mt--10">
                <div className="rbt-form-group">
                  <button type="submit" className="rbt-btn btn-gradient">
                    Update Profile
                  </button>
                </div>
              </div>
            </form>
          </div>
          {/* end social tab */}
        </div>
      </div>
    </div>
  );
};

export default Setting;
