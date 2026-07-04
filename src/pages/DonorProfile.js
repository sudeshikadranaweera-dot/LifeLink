import React from "react";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Navbar from "./Navbar";
import { FaUser, FaTint, FaMapMarkerAlt, FaPhone, FaHeart, FaCheck } from "react-icons/fa";

function DonorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  const districts = [
    "Colombo", "Kandy", "Galle", "Jaffna", "Matara",
    "Kurunegala", "Ratnapura", "Badulla", "Anuradhapura",
    "Trincomalee", "Batticaloa", "Negombo", "Hambantota", "Polonnaruwa"
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const user = auth.currentUser;
      const newAvailability = profile.availability === "Available"
        ? "Not Available" : "Available";
      await updateDoc(doc(db, "users", user.uid), {
        availability: newAvailability
      });
      setProfile({ ...profile, availability: newAvailability });
      setSuccess("Availability updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>My Profile</h2>
            <p>Manage your donor profile and availability</p>
          </div>
        </div>
        <div className="page-content">
          <div style={{maxWidth:"580px", margin:"0 auto"}}>
            <div className="form-card">
              <div style={{
                background:"linear-gradient(135deg, var(--primary), var(--accent))",
                margin:"-32px -32px 28px -32px",
                padding:"36px 32px",
                borderRadius:"20px 20px 0 0",
                textAlign:"center",
                color:"white"
              }}>
                <div style={{
                  width:"80px", height:"80px",
                  background:"rgba(255,255,255,0.2)",
                  borderRadius:"50%",
                  display:"flex", alignItems:"center",
                  justifyContent:"center",
                  margin:"0 auto 16px",
                  fontSize:"36px"
                }}>
                  <FaUser />
                </div>
                <h2 style={{fontSize:"22px", fontWeight:"700", marginBottom:"4px"}}>
                  {profile?.name}
                </h2>
                <p style={{opacity:"0.8", textTransform:"capitalize", marginBottom:"12px"}}>
                  {profile?.role}
                </p>
                <span className={`availability-pill ${profile?.availability === "Available" ? "" : "not-available"}`}>
                  {profile?.availability === "Available" ? "✅ Available to Donate" : "❌ Not Available"}
                </span>
              </div>

              {success && <div className="alert-success">{success}</div>}

              <div style={{display:"flex", flexDirection:"column", gap:"14px", marginBottom:"24px"}}>
                <div style={{
                  display:"flex", alignItems:"center", gap:"14px",
                  padding:"14px 16px", background:"var(--gray-100)",
                  borderRadius:"var(--radius)", border:"1px solid var(--gray-200)"
                }}>
                  <FaHeart style={{color:"var(--emergency)", fontSize:"20px"}} />
                  <div>
                    <span style={{display:"block", fontSize:"11px", color:"var(--gray-500)", fontWeight:"600"}}>Blood Group</span>
                    <span style={{fontSize:"15px", fontWeight:"700", color:"var(--gray-900)"}}>{profile?.bloodGroup}</span>
                  </div>
                </div>
                <div style={{
                  display:"flex", alignItems:"center", gap:"14px",
                  padding:"14px 16px", background:"var(--gray-100)",
                  borderRadius:"var(--radius)", border:"1px solid var(--gray-200)"
                }}>
                  <FaMapMarkerAlt style={{color:"var(--primary)", fontSize:"20px"}} />
                  <div>
                    <span style={{display:"block", fontSize:"11px", color:"var(--gray-500)", fontWeight:"600"}}>District</span>
                    <span style={{fontSize:"15px", fontWeight:"700", color:"var(--gray-900)"}}>{profile?.district}</span>
                  </div>
                </div>
                <div style={{
                  display:"flex", alignItems:"center", gap:"14px",
                  padding:"14px 16px", background:"var(--gray-100)",
                  borderRadius:"var(--radius)", border:"1px solid var(--gray-200)"
                }}>
                  <FaPhone style={{color:"var(--normal)", fontSize:"20px"}} />
                  <div>
                    <span style={{display:"block", fontSize:"11px", color:"var(--gray-500)", fontWeight:"600"}}>Phone</span>
                    <span style={{fontSize:"15px", fontWeight:"700", color:"var(--gray-900)"}}>{profile?.phone}</span>
                  </div>
                </div>
                <div style={{
                  display:"flex", alignItems:"center", gap:"14px",
                  padding:"14px 16px", background:"var(--gray-100)",
                  borderRadius:"var(--radius)", border:"1px solid var(--gray-200)"
                }}>
                  <FaTint style={{color:"var(--emergency)", fontSize:"20px"}} />
                  <div>
                    <span style={{display:"block", fontSize:"11px", color:"var(--gray-500)", fontWeight:"600"}}>Can Donate</span>
                    <span style={{fontSize:"15px", fontWeight:"700", color:"var(--gray-900)"}}>
                      {profile?.donationTypes?.join(", ") || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className={profile?.availability === "Available" ? "btn-danger" : "btn-success"}
                style={{width:"100%", padding:"14px", fontSize:"15px", borderRadius:"var(--radius)"}}
                onClick={toggleAvailability}
              >
                <FaCheck style={{marginRight:"8px"}} />
                {profile?.availability === "Available"
                  ? "Set as Not Available"
                  : "Set as Available"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonorProfile;