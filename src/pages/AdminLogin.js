import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid admin credentials!");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">❤️</div>
        <div style={{textAlign:"center", marginBottom:"20px"}}>
          <p style={{fontSize:"20px", fontWeight:"700", color:"var(--primary)"}}>
            Life Link
          </p>
          <p style={{fontSize:"12px", color:"var(--gray-500)"}}>
            Donate Today, Save Tomorrow
          </p>
        </div>
        <div className="admin-badge">🔐 Admin Access Only</div>
        <h2>Admin Login</h2>
        <p>Sign in to access the admin dashboard</p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="Admin email"
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
                placeholder="Admin password"
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
            style={{width:"100%", padding:"14px", fontSize:"15px", justifyContent:"center"}}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In as Admin"}
          </button>
        </form>

        <a href="/login" className="admin-login-link">
          ← Back to User Login
        </a>

        <div className="admin-info-box">
          🔒 This area is restricted to authorized administrators only
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;