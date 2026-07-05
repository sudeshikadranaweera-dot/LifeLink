import React, { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(
        "✅ Password reset email sent! Please check your inbox and follow the instructions."
      );
      setLoading(false);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* LEFT SIDE */}
      <div className="auth-left">
        <div className="auth-left-circle">🔑</div>
        <h2>Reset Your Password</h2>
        <p>
          Enter your registered email address and we will
          send you a link to reset your password.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-logo">
            <span style={{fontSize:"28px"}}>❤️</span>
            <span>Life Link</span>
          </div>
          <h2 className="auth-form-title">Forgot Password?</h2>
          <p className="auth-form-subtitle">
            Enter your email to receive a reset link
          </p>

          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}

          {!success && (
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  width:"100%", padding:"14px",
                  fontSize:"15px", justifyContent:"center",
                  marginTop:"8px"
                }}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          {success && (
            <button
              className="btn-primary"
              style={{
                width:"100%", padding:"14px",
                fontSize:"15px", justifyContent:"center",
                marginTop:"16px"
              }}
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          )}

          <div className="auth-form-link" style={{marginTop:"20px"}}>
            Remember your password? <a href="/login">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
