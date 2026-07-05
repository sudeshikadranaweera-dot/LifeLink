javascriptimport { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donor");
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, email, password
      );
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: role,
        bloodGroup: bloodGroup,
        createdAt: new Date()
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register for LifeLink</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="donor">Donor</option>
          <option value="hospital">Hospital</option>
        </select>
        <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
}

export default Register;


import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const [role, setRole] = useState("donor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [donationTypes, setDonationTypes] = useState([]);
  const [district, setDistrict] = useState("Colombo");
  const [phone, setPhone] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const districts = [
    "Colombo","Kandy","Galle","Jaffna","Matara","Kurunegala",
    "Ratnapura","Badulla","Anuradhapura","Trincomalee","Batticaloa",
    "Negombo","Hambantota","Polonnaruwa","Ampara","Kegalle","Kalutara",
    "Matale","Nuwara Eliya","Monaragala","Vavuniya","Mullaitivu",
    "Kilinochchi","Mannar","Puttalam"
  ];

  const handleDonationTypeChange = (value) => {
    if (donationTypes.includes(value)) {
      setDonationTypes(donationTypes.filter(t => t !== value));
    } else {
      setDonationTypes([...donationTypes, value]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, email, password
      );
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role,
        phone,
        district,
        bloodGroup: role === "donor" ? bloodGroup : null,
        donationTypes: role === "donor" ? donationTypes : [],
        hospitalAddress: role === "hospital"
          ? hospitalAddress : null,
        registrationNumber: role === "hospital"
          ? registrationNumber : null,
        availability: role === "donor" ? "Available" : null,
        verified: role === "hospital" ? false : null,
        createdAt: new Date()
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">

      {/* LEFT SIDE */}
      <div className="auth-left" style={{
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        justifyContent:"center",
        gap:"24px",
        padding:"40px"
      }}>
        <img
          src="/register.jpg"
          alt="Register"
          style={{
            width:"280px",
            height:"280px",
            objectFit:"cover",
            borderRadius:"50%",
            border:"4px solid rgba(255,255,255,0.3)",
            boxShadow:"0 8px 32px rgba(0,0,0,0.2)"
          }}
        />
        <h2 style={{
          color:"white",
          fontSize:"24px",
          fontWeight:"700",
          textAlign:"center"
        }}>
          {role === "donor"
            ? "Join as a Donor"
            : "Register Your Hospital"}
        </h2>
        <p style={{
          color:"rgba(255,255,255,0.85)",
          fontSize:"14px",
          textAlign:"center",
          lineHeight:"1.6"
        }}>
          {role === "donor"
            ? "Register and be part of Sri Lanka's most trusted donation network."
            : "Register your hospital and start posting donation requests today."}
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right"
        style={{padding:"40px 48px", overflowY:"auto"}}>
        <div className="auth-form-container">

          {/* LOGO */}
          <div className="auth-form-logo">
            <img src="/logo.jpg" alt="LifeLink"
              style={{width:"36px", height:"36px",
              objectFit:"contain", borderRadius:"8px"}} />
            <span>Life Link</span>
          </div>

          <h2 className="auth-form-title">Create Account</h2>
          <p className="auth-form-subtitle">
            Join us and start saving lives today
          </p>

          {error && <div className="alert-error">{error}</div>}

          {/* ROLE TOGGLE */}
          <div className="role-toggle">
            <button type="button"
              className={`role-btn
                ${role === "donor" ? "active" : ""}`}
              onClick={() => setRole("donor")}>
              ❤️ Donor
            </button>
            <button type="button"
              className={`role-btn
                ${role === "hospital" ? "active" : ""}`}
              onClick={() => setRole("hospital")}>
              🏥 Hospital
            </button>
          </div>

          <form onSubmit={handleRegister}>

            {/* ===== COMMON FIELDS ===== */}
            <div className="form-row-2">
              <div className="form-group">
                <label>
                  {role === "donor"
                    ? "Full Name"
                    : "Hospital Name"}
                </label>
                <input className="form-input" type="text"
                  placeholder={role === "donor"
                    ? "Enter your full name"
                    : "Enter hospital name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input className="form-input" type="text"
                  placeholder="07X XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input className="form-input" type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrap">
                  <input className="form-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)}
                    required />
                  <button type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)}>
                    {showPassword
                      ? <FaEyeSlash />
                      : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input className="form-input"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)}
                  required />
              </div>
            </div>

            <div className="form-group">
              <label>District</label>
              <select className="form-select"
                value={district}
                onChange={(e) =>
                  setDistrict(e.target.value)}>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* ===== DONOR SPECIFIC FIELDS ===== */}
            {role === "donor" && (
              <>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select className="form-select"
                    value={bloodGroup}
                    onChange={(e) =>
                      setBloodGroup(e.target.value)}>
                    {["A+","A-","B+","B-","O+","O-",
                      "AB+","AB-"].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>I Can Donate</label>
                  <div style={{
                    display:"grid",
                    gridTemplateColumns:"1fr 1fr",
                    gap:"8px",
                    marginTop:"6px"
                  }}>
                    {[
                      {value:"Blood", label:"🩸 Blood"},
                      {value:"Organ", label:"💚 Organ"},
                      {value:"Hair", label:"✂️ Hair"},
                      {value:"Eye", label:"👁️ Eye"}
                    ].map(type => (
                      <label key={type.value} style={{
                        display:"flex",
                        alignItems:"center",
                        gap:"8px",
                        padding:"10px 14px",
                        background:
                          donationTypes.includes(type.value)
                            ? "var(--primary-light)"
                            : "var(--gray-100)",
                        border:
                          donationTypes.includes(type.value)
                            ? "2px solid var(--primary)"
                            : "2px solid var(--gray-200)",
                        borderRadius:"var(--radius)",
                        cursor:"pointer",
                        fontSize:"13px",
                        fontWeight:"500"
                      }}>
                        <input type="checkbox"
                          checked={donationTypes.includes(
                            type.value)}
                          onChange={() =>
                            handleDonationTypeChange(
                              type.value)}
                          style={{
                            accentColor:"var(--primary)"
                          }} />
                        {type.label}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ===== HOSPITAL SPECIFIC FIELDS ===== */}
            {role === "hospital" && (
              <>
                <div className="form-group">
                  <label>Hospital Registration Number</label>
                  <input className="form-input" type="text"
                    placeholder="Enter official registration number"
                    value={registrationNumber}
                    onChange={(e) =>
                      setRegistrationNumber(e.target.value)}
                    required />
                </div>
                <div className="form-group">
                  <label>Hospital Address</label>
                  <textarea className="form-textarea"
                    placeholder="Enter full hospital address"
                    value={hospitalAddress}
                    onChange={(e) =>
                      setHospitalAddress(e.target.value)}
                    required />
                </div>
              </>
            )}

            <button type="submit" className="btn-primary"
              style={{
                width:"100%",
                padding:"14px",
                fontSize:"15px",
                justifyContent:"center",
                marginTop:"8px"
              }}
              disabled={loading}>
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>

          <div className="auth-form-link">
            Already have an account?{" "}
            <a href="/login">Sign in</a>
          </div>

        </div>
      </div>
    </div>
  );
}
