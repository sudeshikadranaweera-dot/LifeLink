javascriptimport { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      setError("Invalid email or password!");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login to LifeLink</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
}

export default Login;

import React, { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, email, password
      );
      const user = userCredential.user;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const role = docSnap.data().role;
        if (role === "hospital") {
          navigate("/hospital/dashboard");
        } else {
          navigate("/home");
        }
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">

      {/* LEFT SIDE */}
      <div className="auth-left">
        <div className="auth-left-circle">❤️</div>
        <h2>Welcome to LifeLink</h2>
        <p>
          Your donation can bring hope and
          save lives across Sri Lanka.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">
        <div className="auth-form-container">

          {/* LOGO */}
          <div className="auth-form-logo">
            <img src="/logo.jpg" alt="LifeLink"
              style={{
                width:"36px",
                height:"36px",
                objectFit:"contain",
                borderRadius:"8px"
              }} />
            <span>Life Link</span>
          </div>

          <h2 className="auth-form-title">Welcome Back!</h2>
          <p className="auth-form-subtitle">
            Login to continue to your account
          </p>

          {error && (
            <div className="alert-error">{error}</div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrap">
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width:"100%",
                padding:"14px",
                fontSize:"15px",
                justifyContent:"center",
                marginTop:"8px"
              }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="auth-form-link">
            Don't have an account?{" "}
            <a href="/register">Register</a>
          </div>

          <div className="auth-form-link"
            style={{marginTop:"10px"}}>
            <a href="/forgot-password"
              style={{
                color:"var(--gray-500)",
                fontSize:"13px"
              }}>
              Forgot your password?
            </a>
          </div>

          <a href="/admin" className="admin-login-link">
            Admin Login →
          </a>

        </div>
      </div>
    </div>
  );
}

export default Login;
