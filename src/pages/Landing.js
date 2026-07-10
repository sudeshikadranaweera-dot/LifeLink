import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>

      {/* ===== NAVBAR ===== */}
      <nav className="landing-navbar">
        <div className="landing-logo">
          <img src="/logo.jpg" alt="LifeLink Logo"
            style={{width:"44px", height:"44px",
            objectFit:"contain"}} />
          <div>
            <span className="landing-logo-text">Life Link</span>
            <span className="landing-logo-tagline">
              Donate Today, Save Tomorrow
            </span>
          </div>
        </div>
        <div className="landing-nav-links">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#how">How It Works</a>
          <a href="#contact">Contact Us</a>
        </div>
        <div className="landing-nav-buttons">
          <button className="btn-secondary"
            onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn-primary"
            onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="hero-section" id="home">
        <div className="hero-left">
          <div className="hero-pill">
            <FaHeart /> Sri Lanka's Donation Network
          </div>
          <h1 className="hero-title">
            Together, We Can<br />
            <span>Save More Lives</span>
          </h1>
          <p className="hero-subtitle">
            Life Link connects donors with hospitals for blood,
            organs, hair and other medical needs across Sri Lanka
            — making emergency response faster and more reliable.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary"
              onClick={() => navigate("/register")}
              style={{padding:"14px 32px", fontSize:"15px"}}>
              I Want to Donate
            </button>
            <button className="btn-secondary"
              onClick={() => navigate("/register")}
              style={{padding:"14px 32px", fontSize:"15px"}}>
              I Need Donation
            </button>
          </div>
        </div>

        {/* ===== HERO IMAGE — NO GREEN CIRCLE ===== */}
        <div className="hero-right">
          <img
            src="/hero.jpg"
            src="hero.jpg"
src="../hero.jpg"
            alt="LifeLink Hero"
            style={{
              width:"520px",
    height:"520px",
    objectFit:"contain",
    borderRadius:"40px",
    maskImage:"radial-gradient(ellipse 85% 85% at 50% 50%, black 60%, transparent 100%)",
    WebkitMaskImage:"radial-gradient(ellipse 85% 85% at 50% 50%, black 60%, transparent 90%)"
  }}
    />  
        </div>
      </section>

      {/* ===== DONATION TYPES ===== */}
      <section className="donation-types-section" id="about">
        <p className="section-subtitle">
          We Connect Donations That Save Lives
        </p>
        <h2 className="section-title">Types of Donations</h2>
        <div className="donation-types-grid">
          <div className="donation-type-card">
            <span className="donation-type-emoji">🩸</span>
            <h3>Blood Donation</h3>
            <p>Donate blood to save lives during emergencies
              and surgeries across Sri Lanka</p>
          </div>
          <div className="donation-type-card">
            <span className="donation-type-emoji">💚</span>
            <h3>Organ Donation</h3>
            <p>Give the gift of life by donating organs like
              kidney, liver, heart and more</p>
          </div>
          <div className="donation-type-card">
            <span className="donation-type-emoji">✂️</span>
            <h3>Hair Donation</h3>
            <p>Donate your hair to help cancer patients
              and others who need it most</p>
          </div>
          <div className="donation-type-card">
            <span className="donation-type-emoji">👁️</span>
            <h3>Eye Donation</h3>
            <p>Restore sight by donating your eyes and help
              someone see the world again</p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="how-it-works" id="how">
        <p className="section-subtitle">Simple Steps</p>
        <h2 className="section-title">How It Works</h2>
        <div className="how-it-works-grid">
          <div className="how-it-card">
            <span className="how-it-emoji">📝</span>
            <p className="how-it-step">STEP 01</p>
            <h3>Register</h3>
            <p>Create your account as a donor or hospital
              and set up your profile with your
              donation preferences</p>
          </div>
          <div className="how-it-card">
            <span className="how-it-emoji">🔍</span>
            <p className="how-it-step">STEP 02</p>
            <h3>Find Requests</h3>
            <p>Browse verified donation requests from
              hospitals across Sri Lanka and filter
              by type and district</p>
          </div>
          <div className="how-it-card">
            <span className="how-it-emoji">❤️</span>
            <p className="how-it-step">STEP 03</p>
            <h3>Save Lives</h3>
            <p>Respond to requests, connect with hospitals
              and make a real difference in
              someone's life today</p>
          </div>
        </div>
      </section>

      {/* ===== CONTACT US ===== */}
      <section style={{
        background:"white",
        padding:"70px 60px",
        textAlign:"center"
      }} id="contact">
        <p className="section-subtitle">Get In Touch</p>
        <h2 className="section-title">Contact Us</h2>
        <p style={{
          color:"var(--gray-500)",
          fontSize:"15px",
          marginBottom:"40px"
        }}>
          Have questions about LifeLink? We are here to help!
        </p>
        <div style={{
          display:"flex",
          justifyContent:"center",
          gap:"32px",
          flexWrap:"wrap",
          marginBottom:"40px"
        }}>
          <div style={{
            background:"var(--primary-light)",
            borderRadius:"var(--radius-lg)",
            padding:"32px 40px",
            textAlign:"center",
            minWidth:"180px"
          }}>
            <p style={{fontSize:"36px", marginBottom:"12px"}}>📧</p>
            <p style={{fontWeight:"700", fontSize:"15px",
              color:"var(--gray-900)", marginBottom:"6px"}}>
              Email Us
            </p>
            <p style={{color:"var(--gray-500)", fontSize:"13px"}}>
              support@lifelink.lk
            </p>
          </div>
          <div style={{
            background:"var(--primary-light)",
            borderRadius:"var(--radius-lg)",
            padding:"32px 40px",
            textAlign:"center",
            minWidth:"180px"
          }}>
            <p style={{fontSize:"36px", marginBottom:"12px"}}>📞</p>
            <p style={{fontWeight:"700", fontSize:"15px",
              color:"var(--gray-900)", marginBottom:"6px"}}>
              Call Us
            </p>
            <p style={{color:"var(--gray-500)", fontSize:"13px"}}>
              +94 11 234 5678
            </p>
          </div>
          <div style={{
            background:"var(--primary-light)",
            borderRadius:"var(--radius-lg)",
            padding:"32px 40px",
            textAlign:"center",
            minWidth:"180px"
          }}>
            <p style={{fontSize:"36px", marginBottom:"12px"}}>📍</p>
            <p style={{fontWeight:"700", fontSize:"15px",
              color:"var(--gray-900)", marginBottom:"6px"}}>
              Location
            </p>
            <p style={{color:"var(--gray-500)", fontSize:"13px"}}>
              Colombo, Sri Lanka
            </p>
          </div>
          <div style={{
            background:"var(--primary-light)",
            borderRadius:"var(--radius-lg)",
            padding:"32px 40px",
            textAlign:"center",
            minWidth:"180px"
          }}>
            <p style={{fontSize:"36px", marginBottom:"12px"}}>🕐</p>
            <p style={{fontWeight:"700", fontSize:"15px",
              color:"var(--gray-900)", marginBottom:"6px"}}>
              Working Hours
            </p>
            <p style={{color:"var(--gray-500)", fontSize:"13px"}}>
              24 Hours / 7 Days
            </p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="footer-logo">
          <img src="/logo.jpg" alt="LifeLink"
            style={{width:"32px", height:"32px",
            objectFit:"contain", borderRadius:"6px"}} />
          Life Link
        </div>
        <p style={{color:"rgba(255,255,255,0.7)", fontSize:"14px"}}>
          © 2026 LifeLink — Donation Management System for Sri Lanka
        </p>
        <p style={{color:"rgba(255,255,255,0.7)", fontSize:"14px"}}>
          Saving lives, one donation at a time 💚
        </p>
      </footer>

    </div>
  );
}

export default LandingPage;