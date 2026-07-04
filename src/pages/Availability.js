import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Navbar from "./Navbar";

function Availability() {
  const user = auth.currentUser;
  const [availability, setAvailability] = useState("Available");
  const [donationTypes, setDonationTypes] = useState([]);
  const [days, setDays] = useState([]);
  const [district, setDistrict] = useState("Colombo");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const districts = [
    "Colombo","Kandy","Galle","Jaffna","Matara","Kurunegala",
    "Ratnapura","Badulla","Anuradhapura","Trincomalee","Batticaloa",
    "Negombo","Hambantota","Polonnaruwa","Ampara","Kegalle","Kalutara",
    "Matale","Nuwara Eliya","Monaragala","Vavuniya","Mullaitivu",
    "Kilinochchi","Mannar","Puttalam"
  ];

  const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAvailability(data.availability || "Available");
            setDonationTypes(data.donationTypes || []);
            setDistrict(data.district || "Colombo");
            setDays(data.availableDays || []);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const toggleType = (type) => {
    if (donationTypes.includes(type)) {
      setDonationTypes(donationTypes.filter(t => t !== type));
    } else {
      setDonationTypes([...donationTypes, type]);
    }
  };

  const toggleDay = (day) => {
    if (days.includes(day)) {
      setDays(days.filter(d => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError("You must be logged in to save.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateDoc(doc(db, "users", user.uid), {
        availability: availability,
        donationTypes: donationTypes,
        district: district,
        availableDays: days
      });
      setSuccess("✅ Availability updated! Hospitals can now find you.");
      setTimeout(() => setSuccess(""), 4000);
      setSaving(false);
    } catch (err) {
      console.error("Save error:", err);
      setError("❌ Failed to save. Please try again.");
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">
        <div className="loading">
          <div className="spinner"></div>
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
            <h2>My Availability</h2>
            <p>Let hospitals know you are ready to donate</p>
          </div>
        </div>
        <div className="page-content">
          <div style={{maxWidth:"600px", margin:"0 auto",
            display:"flex", flexDirection:"column", gap:"20px"}}>

            {/* SUCCESS MESSAGE */}
            {success && (
              <div className="alert-success">{success}</div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
              <div className="alert-error">{error}</div>
            )}

            {/* AVAILABILITY TOGGLE */}
            <div className="form-card">
              <h3 style={{fontSize:"16px", fontWeight:"700",
                marginBottom:"16px"}}>
                Current Status
              </h3>
              <div style={{
                display:"flex", alignItems:"center",
                justifyContent:"space-between",
                padding:"20px",
                background:"var(--gray-100)",
                borderRadius:"var(--radius)",
                marginBottom:"12px"
              }}>
                <div>
                  <p style={{fontWeight:"700", fontSize:"16px",
                    color: availability === "Available"
                      ? "var(--normal)" : "var(--gray-500)"}}>
                    {availability === "Available"
                      ? "● AVAILABLE"
                      : "○ NOT AVAILABLE"}
                  </p>
                  <p style={{fontSize:"13px",
                    color:"var(--gray-500)", marginTop:"4px"}}>
                    {availability === "Available"
                      ? "You are visible to hospitals seeking donors"
                      : "You are hidden from hospital searches"}
                  </p>
                </div>
                <button
                  onClick={() => setAvailability(
                    availability === "Available"
                      ? "Not Available"
                      : "Available"
                  )}
                  style={{
                    width:"56px", height:"28px",
                    borderRadius:"99px", border:"none",
                    cursor:"pointer",
                    background: availability === "Available"
                      ? "var(--normal)"
                      : "var(--gray-200)",
                    transition:"all 0.3s",
                    position:"relative"
                  }}>
                  <div style={{
                    width:"22px", height:"22px",
                    borderRadius:"50%",
                    background:"white",
                    position:"absolute",
                    top:"3px",
                    left: availability === "Available"
                      ? "30px" : "3px",
                    transition:"all 0.3s",
                    boxShadow:"0 2px 4px rgba(0,0,0,0.2)"
                  }}></div>
                </button>
              </div>
            </div>

            {/* DONATION TYPES */}
            <div className="form-card">
              <h3 style={{fontSize:"16px", fontWeight:"700",
                marginBottom:"16px"}}>
                What can you donate?
              </h3>
              <div style={{display:"grid",
                gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
                {[
                  {value:"Blood", label:"🩸 Blood Donation"},
                  {value:"Organ", label:"💚 Organ Donation"},
                  {value:"Hair", label:"✂️ Hair Donation"},
                  {value:"Eye", label:"👁️ Eye Donation"}
                ].map(type => (
                  <label key={type.value} style={{
                    display:"flex", alignItems:"center",
                    gap:"10px", padding:"12px 16px",
                    background: donationTypes.includes(type.value)
                      ? "var(--primary-light)"
                      : "var(--gray-100)",
                    border: donationTypes.includes(type.value)
                      ? "2px solid var(--primary)"
                      : "2px solid var(--gray-200)",
                    borderRadius:"var(--radius)",
                    cursor:"pointer",
                    fontSize:"13px", fontWeight:"500",
                    transition:"all 0.2s"
                  }}>
                    <input
                      type="checkbox"
                      checked={donationTypes.includes(type.value)}
                      onChange={() => toggleType(type.value)}
                      style={{
                        accentColor:"var(--primary)",
                        width:"16px", height:"16px"
                      }}
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>

            {/* AVAILABLE DAYS */}
            <div className="form-card">
              <h3 style={{fontSize:"16px", fontWeight:"700",
                marginBottom:"16px"}}>
                Available Days
              </h3>
              <div style={{display:"flex",
                gap:"8px", flexWrap:"wrap"}}>
                {weekDays.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    style={{
                      padding:"8px 16px",
                      borderRadius:"99px",
                      border:"2px solid",
                      borderColor: days.includes(day)
                        ? "var(--primary)"
                        : "var(--gray-200)",
                      background: days.includes(day)
                        ? "var(--primary-light)"
                        : "white",
                      color: days.includes(day)
                        ? "var(--primary)"
                        : "var(--gray-700)",
                      fontWeight:"600",
                      fontSize:"13px",
                      cursor:"pointer",
                      fontFamily:"'Poppins', sans-serif",
                      transition:"all 0.2s"
                    }}>
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* DISTRICT */}
            <div className="form-card">
              <h3 style={{fontSize:"16px", fontWeight:"700",
                marginBottom:"16px"}}>
                Primary District
              </h3>
              <select
                className="form-select"
                value={district}
                onChange={e => setDistrict(e.target.value)}>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* SAVE BUTTON */}
            <button
              className="btn-primary"
              style={{
                width:"100%", padding:"14px",
                justifyContent:"center", fontSize:"15px"
              }}
              onClick={handleSave}
              disabled={saving}>
              {saving ? "Saving..." : "✅ Save Availability"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Availability;