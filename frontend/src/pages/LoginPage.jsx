import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  MdFastfood,
  MdLunchDining,
  MdWhatshot,
  MdLocalDrink,
  MdAutoAwesome,
  MdIcecream,
  MdBakeryDining,
  MdCookie,
  MdVisibility,
  MdVisibilityOff,
  MdCheck,
  MdArrowForward,
  MdHourglassEmpty,
  MdWarning,
  MdEmail,
  MdPhoneIphone
} from "react-icons/md";

/* ─── Fonts ─────────────────────────────────────────────────────────── */
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
);

/* ─── Floating food emojis for the left panel ───────────────────────── */
const FLOATERS = [
  { icon: <MdFastfood />, size: 48, x: 12, y: 8, dur: 6.2, delay: 0 },
  { icon: <MdLunchDining />, size: 34, x: 72, y: 14, dur: 7.8, delay: 1.2 },
  { icon: <MdWhatshot />, size: 28, x: 38, y: 55, dur: 5.5, delay: 0.7 },
  { icon: <MdLocalDrink />, size: 36, x: 85, y: 62, dur: 8.1, delay: 2.1 },
  { icon: <MdAutoAwesome />, size: 22, x: 55, y: 30, dur: 4.8, delay: 3.0 },
  { icon: <MdIcecream />, size: 30, x: 20, y: 78, dur: 7.0, delay: 1.8 },
  { icon: <MdBakeryDining />, size: 26, x: 65, y: 88, dur: 6.6, delay: 0.4 },
  { icon: <MdCookie />, size: 32, x: 90, y: 35, dur: 9.0, delay: 2.6 },
  { icon: <MdFastfood />, size: 24, x: 48, y: 72, dur: 5.9, delay: 1.5 },
  { icon: <MdLunchDining />, size: 30, x: 8, y: 45, dur: 7.3, delay: 3.4 },
];

/* ─── Input field ────────────────────────────────────────────────────── */
const Field = ({ label, type = "text", value, onChange, placeholder, error, autoComplete, children }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700, fontSize: 11,
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: focused ? "#F59E0B" : "#57534E",
        transition: "color 0.2s",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: "13px 16px",
            paddingRight: children ? 48 : 16,
            background: focused ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.03)",
            border: `1.5px solid ${error ? "#EF4444" : focused ? "#F59E0B" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 10,
            color: "#F5F5F4",
            fontFamily: "'Barlow', sans-serif",
            fontSize: 14,
            outline: "none",
            transition: "all 0.2s",
            boxSizing: "border-box",
          }}
        />
        {children && (
          <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
            {children}
          </div>
        )}
      </div>
      {error && (
        <span style={{
          fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#EF4444",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <MdWarning size={14} /> {error}
        </span>
      )}
    </div>
  );
};

/* ─── Social Button ──────────────────────────────────────────────────── */
const SocialBtn = ({ icon, label }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        background: hover ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10, padding: "11px 0",
        cursor: "pointer", transition: "all 0.2s",
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 600, fontSize: 13, letterSpacing: "0.06em",
        color: "#A8A29E",
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </button>
  );
};

/* ─── Divider ────────────────────────────────────────────────────────── */
const Divider = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: "0.18em", color: "#3D3632", textTransform: "uppercase" }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
  </div>
);

/* ─── Left Brand Panel ───────────────────────────────────────────────── */
const BrandPanel = ({ mode }) => (
  <div style={{
    flex: 1, position: "relative", overflow: "hidden",
    background: "linear-gradient(160deg,#1C0E00 0%,#0C0A09 60%,#130800 100%)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "60px 48px",
    minHeight: "100vh",
  }}>
    {/* Background radial glow */}
    <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />

    {/* Diagonal stripe texture */}
    <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,rgba(255,255,255,0.012) 0px,rgba(255,255,255,0.012) 1px,transparent 1px,transparent 48px)", pointerEvents: "none" }} />

    {/* Floating emojis */}
    {FLOATERS.map((f, i) => (
      <div key={i} style={{
        position: "absolute",
        left: `${f.x}%`, top: `${f.y}%`,
        fontSize: f.size,
        opacity: 0.18,
        animation: `floatItem ${f.dur}s ease-in-out ${f.delay}s infinite`,
        pointerEvents: "none",
        userSelect: "none",
        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
      }}>
        {React.cloneElement(f.icon, { size: f.size })}
      </div>
    ))}

    {/* Content */}
    <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 360 }}>
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 8, animation: "logoFloat 3s ease-in-out infinite", color: "#F59E0B", display: "flex", justifyContent: "center" }}>
          <MdFastfood />
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, letterSpacing: "0.05em", color: "#F5F5F4", lineHeight: 1 }}>
          BURGER<span style={{ color: "#F59E0B" }}>HUB</span>
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 10, letterSpacing: "0.3em", color: "#44403C", textTransform: "uppercase", marginTop: 4 }}>
          Seriously Good Burgers
        </div>
      </div>

      {/* Message */}
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px,3vw,42px)", color: "#F5F5F4", letterSpacing: "0.03em", lineHeight: 0.95, marginBottom: 16 }}>
        {mode === "login" ? (
          <>WELCOME<br /><span style={{ color: "#F59E0B" }}>BACK.</span></>
        ) : (
          <>JOIN THE<br /><span style={{ color: "#F59E0B" }}>CREW.</span></>
        )}
      </div>
      <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#57534E", lineHeight: 1.6 }}>
        {mode === "login"
          ? "Your next meal is just a few taps away. Sign in and let's get ordering."
          : "Create your account and enjoy exclusive deals, fast reorders, and live tracking."}
      </p>

      {/* Feature pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 28 }}>
        {["⚡ 25-min delivery", "🎁 Member deals", "📦 Order history", "🛵 Live tracking"].map(f => (
          <span key={f} style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 600, fontSize: 11, letterSpacing: "0.1em",
            color: "#57534E",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "5px 12px", borderRadius: 999,
          }}>{f}</span>
        ))}
      </div>
    </div>
  </div>
);

/* ─── LOGIN FORM ─────────────────────────────────────────────────────── */
const LoginForm = ({ onSwitch }) => {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    console.log('Attempting login with:', email, password);
    const success = await login(email, password);
    console.log('Login result:', success);
    setLoading(false);
    if (success) {
      // Get the referrer or check if we came from checkout
      const from = new URLSearchParams(window.location.search).get('from');
      // Check if user is admin and redirect accordingly
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'admin') {
        navigate(from || "/admin");
      } else {
        navigate(from || "/checkout");
      }
    }
  };


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, color: "#F5F5F4", letterSpacing: "0.04em", lineHeight: 1 }}>
          Sign In
        </h1>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#57534E", marginTop: 6 }}>
          Good to have you back. Let's get you fed.
        </p>
      </div>

      {/* Social */}
      <div style={{ display: "flex", gap: 10 }}>
        <SocialBtn icon={<MdEmail />} label="Google" />
        <SocialBtn icon={<MdPhoneIphone />} label="Apple" />
      </div>

      <Divider label="or with email" />

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field
          label="Email Address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={errors.email}
          autoComplete="email"
        />
        <Field
          label="Password"
          type={showPw ? "text" : "password"}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          error={errors.password}
          autoComplete="current-password"
        >
          <button
            onClick={() => setShowPw(s => !s)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#57534E", fontSize: 18, padding: 0, lineHeight: 1, display: "flex" }}
          >
            {showPw ? <MdVisibilityOff /> : <MdVisibility />}
          </button>
        </Field>
      </div>

      {/* Forgot */}
      <div style={{ textAlign: "right", marginTop: -8 }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.08em", color: "#78716C", textDecoration: "underline", textDecorationColor: "rgba(255,255,255,0.15)" }}>
          Forgot password?
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={(e) => handleSubmit(e)}
        disabled={loading}
        style={{
          width: "100%",
          background: loading ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg,#F59E0B,#D97706)",
          color: "#1C1917", border: "none", cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 17, letterSpacing: "0.12em", textTransform: "uppercase",
          padding: "15px", borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "all 0.2s",
          boxShadow: loading ? "none" : "0 0 20px rgba(245,158,11,0.25)",
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 0 32px rgba(245,158,11,0.5)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = loading ? "none" : "0 0 20px rgba(245,158,11,0.25)"; }}
      >
        {loading ? (
          <>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>
              <MdHourglassEmpty size={24} />
            </span>
            Signing In…
          </>
        ) : (
          <>
            Sign In <MdArrowForward size={20} />
          </>
        )}
      </button>

      {/* Switch */}
      <p style={{ textAlign: "center", fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#57534E" }}>
        New to BurgerHub?{" "}
        <button
          onClick={onSwitch}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#F59E0B", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em" }}
        >
          Create an account
        </button>
      </p>
    </div>
  );
};

/* ─── REGISTER FORM ──────────────────────────────────────────────────── */
const RegisterForm = ({ onSwitch }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
      : password.length < 10 ? 2
        : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
          : 3;

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#EF4444", "#F59E0B", "#60A5FA", "#22C55E"][strength];

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";
    if (password !== confirm) e.confirm = "Passwords don't match";
    if (!agree) e.agree = "Please accept the terms";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    const success = await register({ name, email, password });
    setLoading(false);
    if (success) {
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000); // Redirect after animation
    }
  };

  if (success) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, padding: 40 }}>
        <div style={{ fontSize: 72, animation: "logoFloat 2s ease-in-out infinite", color: "#F59E0B" }}>
          <MdFastfood />
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#F59E0B", letterSpacing: "0.04em" }}>You're in the crew!</div>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#78716C", textAlign: "center" }}>Account created successfully. Let's get you to the menu…</p>
        <div style={{ width: 200, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginTop: 12 }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg,#F59E0B,#22C55E)", borderRadius: 2, animation: "loadBar 1.5s linear forwards" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, color: "#F5F5F4", letterSpacing: "0.04em", lineHeight: 1 }}>
          Create Account
        </h1>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#57534E", marginTop: 6 }}>
          Join thousands of burger lovers. Takes 30 seconds.
        </p>
      </div>

      {/* Social */}
      <div style={{ display: "flex", gap: 10 }}>
        <SocialBtn icon={<MdEmail />} label="Google" />
        <SocialBtn icon={<MdPhoneIphone />} label="Apple" />
      </div>

      <Divider label="or create with email" />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field
          label="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Alex Johnson"
          error={errors.name}
          autoComplete="name"
        />
        <Field
          label="Email Address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={errors.email}
          autoComplete="email"
        />
        <div>
          <Field
            label="Password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            error={errors.password}
            autoComplete="new-password"
          >
            <button
              onClick={() => setShowPw(s => !s)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#57534E", fontSize: 18, padding: 0, lineHeight: 1, display: "flex" }}
            >
              {showPw ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </Field>

          {/* Password strength bar */}
          {password.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  background: strengthColor,
                  width: `${(strength / 4) * 100}%`,
                  transition: "width 0.3s, background 0.3s",
                }} />
              </div>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", color: strengthColor, minWidth: 40 }}>
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        <Field
          label="Confirm Password"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Repeat password"
          error={errors.confirm}
          autoComplete="new-password"
        />
      </div>

      {/* Terms */}
      <div>
        <button
          onClick={() => setAgree(a => !a)}
          style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left",
          }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
            background: agree ? "#F59E0B" : "transparent",
            border: `2px solid ${agree ? "#F59E0B" : "rgba(255,255,255,0.18)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, color: "#1C1917", fontWeight: 900,
            transition: "all 0.15s",
          }}>
            {agree ? "✓" : ""}
          </div>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#78716C", lineHeight: 1.5 }}>
            I agree to the{" "}
            <span style={{ color: "#F59E0B", textDecoration: "underline", cursor: "pointer" }}>Terms of Service</span>
            {" "}and{" "}
            <span style={{ color: "#F59E0B", textDecoration: "underline", cursor: "pointer" }}>Privacy Policy</span>
          </span>
        </button>
        {errors.agree && (
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#EF4444", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <MdWarning size={14} /> {errors.agree}
          </span>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          background: loading ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg,#F59E0B,#D97706)",
          color: "#1C1917", border: "none", cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 17, letterSpacing: "0.12em", textTransform: "uppercase",
          padding: "15px", borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "all 0.2s",
          boxShadow: loading ? "none" : "0 0 20px rgba(245,158,11,0.25)",
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 0 32px rgba(245,158,11,0.5)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = loading ? "none" : "0 0 20px rgba(245,158,11,0.25)"; }}
      >
        {loading ? (
          <>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>
              <MdHourglassEmpty size={24} />
            </span>
            Creating Account…
          </>
        ) : (
          <>
            Create Account <MdArrowForward size={20} />
          </>
        )}
      </button>

      {/* Switch */}
      <p style={{ textAlign: "center", fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#57534E" }}>
        Already have an account?{" "}
        <button
          onClick={onSwitch}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#F59E0B", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em" }}
        >
          Sign in instead
        </button>
      </p>
    </div>
  );
};

/* ─── Main Auth Page ─────────────────────────────────────────────────── */
export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [transitioning, setTransitioning] = useState(false);

  const switchMode = () => {
    setTransitioning(true);
    setTimeout(() => {
      setMode(m => m === "login" ? "register" : "login");
      setTransitioning(false);
    }, 200);
  };

  return (
    <>
      <FontLink />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0C0A09; }
        @keyframes floatItem {
          0%,100% { transform: translateY(0) rotate(0deg); }
          33%      { transform: translateY(-12px) rotate(5deg); }
          66%      { transform: translateY(6px) rotate(-3deg); }
        }
        @keyframes logoFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes loadBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes formIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: #3D3632; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #3D3632; border-radius: 2px; }
        @media (max-width: 768px) {
          .auth-left { display: none !important; }
          .auth-right { border-radius: 0 !important; min-height: 100vh; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#0C0A09",
        display: "flex",
        fontFamily: "'Barlow', sans-serif",
        color: "#F5F5F4",
      }}>
        {/* Left panel */}
        <div className="auth-left" style={{ flex: "0 0 45%", maxWidth: 480 }}>
          <BrandPanel mode={mode} />
        </div>

        {/* Right form panel */}
        <div className="auth-right" style={{
          flex: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px 32px",
          background: "#0C0A09",
          overflowY: "auto",
        }}>
          <div style={{
            width: "100%", maxWidth: 420,
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? "translateY(10px)" : "none",
            transition: "all 0.2s ease",
            animation: !transitioning ? "formIn 0.4s ease" : "none",
          }}>
            {/* Mobile logo */}
            <div style={{ textAlign: "center", marginBottom: 32, display: "none" }} className="mobile-logo">
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#F5F5F4", letterSpacing: "0.05em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <MdFastfood style={{ color: "#F59E0B" }} /> BURGER<span style={{ color: "#F59E0B" }}>HUB</span>
              </div>
            </div>

            {mode === "login"
              ? <LoginForm onSwitch={switchMode} />
              : <RegisterForm onSwitch={switchMode} />
            }
          </div>
        </div>
      </div>

      {/* Mobile logo show */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-logo { display: block !important; }
        }
      `}</style>
    </>
  );
}
