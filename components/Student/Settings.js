"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

  // Fetch user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const res = await fetch("/api/auth", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
        setBio(data?.bio || "");
        setSocialLinks({
          facebook: data?.facebook || "",
          twitter: data?.twitter || "",
          linkedin: data?.linkedin || "",
          website: data?.website || "",
          github: data?.github || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Update profile handler
  const handleUpdateProfile = async (e) => {
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
        body: JSON.stringify({
          firstName: user?.fullName?.split(" ")[0] || "",
          lastName: user?.fullName?.split(" ")[1] || "",
          phone: user?.phone || "",
          bio,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setUser(data.user);
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  // Update social links handler
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

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
      <div className="content">
        <div className="section-title">
          <h4 className="rbt-title-style-3">Settings</h4>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs tab-button-style-2 justify-content-start" id="settinsTab-4" role="tablist">
          <li role="presentation">
            <button className="tab-button active" data-bs-target="#profile" type="button" role="tab">
              Profile
            </button>
          </li>
          <li role="presentation">
            <button className="tab-button" data-bs-target="#social" type="button" role="tab">
              Social Share
            </button>
          </li>
        </ul>

        <div className="tab-content">
          {/* Profile Tab */}
          <div className="tab-pane fade show active" id="profile" role="tabpanel">
            <form className="rbt-profile-row rbt-default-form row row--15" onSubmit={handleUpdateProfile}>
              <div className="col-lg-6">
                <label>First Name</label>
                <input
                  type="text"
                  value={user?.fullName?.split(" ")[0] || ""}
                  onChange={(e) =>
                    setUser({ ...user, fullName: `${e.target.value} ${user?.fullName?.split(" ")[1] || ""}` })
                  }
                />
              </div>
              <div className="col-lg-6">
                <label>Last Name</label>
                <input
                  type="text"
                  value={user?.fullName?.split(" ")[1] || ""}
                  onChange={(e) =>
                    setUser({ ...user, fullName: `${user?.fullName?.split(" ")[0] || ""} ${e.target.value}` })
                  }
                />
              </div>
              <div className="col-lg-6">
                <label>Phone</label>
                <input
                  type="tel"
                  value={user?.phone || ""}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />
              </div>
              <div className="col-12 mt--20">
                <button type="submit" className="rbt-btn btn-gradient">
                  Update Profile
                </button>
              </div>
            </form>
          </div>

          {/* Social Tab */}
          <div className="tab-pane fade" id="social" role="tabpanel">
            <form className="rbt-profile-row rbt-default-form row row--15" onSubmit={handleUpdateSocial}>
              {["facebook", "twitter", "linkedin", "website", "github"].map((key) => (
                <div className="col-12" key={key}>
                  <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                  <input
                    type="text"
                    value={socialLinks[key]}
                    onChange={(e) => setSocialLinks({ ...socialLinks, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="col-12 mt--20">
                <button type="submit" className="rbt-btn btn-gradient">
                  Update Social Links
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
