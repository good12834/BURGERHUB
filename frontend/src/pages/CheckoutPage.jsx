import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MdFastfood,
  MdLunchDining,
  MdLocalDrink,
  MdHome,
  MdWork,
  MdLocationOn,
  MdCreditCard,
  MdCheckCircle,
  MdCheck,
  MdWarning,
  MdLock,
  MdDeliveryDining,
  MdCelebration,
  MdAttachMoney,
  MdLayers,
  MdLightbulbOutline,
  MdHourglassEmpty,
  MdArrowForward,
  MdArrowBack,
  MdPayment,
  MdSmartphone,
  MdTimer,
  MdClose,
  MdSecurity,
  MdVerified,
  MdDiscount,
  MdLocalShipping,
  MdRestaurant,
  MdSchedule,
  MdPhone,
  MdEmail,
  MdPerson,
  MdEdit,
  MdDelete,
  MdAdd,
  MdErrorOutline,
  MdInfoOutline
} from "react-icons/md";
import { FaApple, FaGooglePay, FaPaypal } from "react-icons/fa";
import { SiVisa, SiMastercard, SiAmericanexpress } from "react-icons/si";
import StripePayment from "../components/StripePayment";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/* ─── Fonts ─────────────────────────────────────────────────────────── */
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
);

/* ─── Mock data ──────────────────────────────────────────────────────── */
const SAVED_ADDRESSES = [
  { id: 1, label: "Home", icon: <MdHome />, line: "14 Jaffa Road, Jerusalem, 9423117", isDefault: true },
  { id: 2, label: "Work", icon: <MdWork />, line: "3 Herzl St, Tel Aviv, 6578901", isDefault: false },
];

const COUPONS = [
  { code: "WELCOME20", discount: 20, type: "percentage", minOrder: 15, expiry: "2024-12-31" },
  { code: "FREESHIP", discount: 3.99, type: "fixed", minOrder: 20, expiry: "2024-12-31" },
  { code: "BURGER10", discount: 10, type: "percentage", minOrder: 10, expiry: "2024-12-31" },
];

/* ─── Steps config ───────────────────────────────────────────────────── */
const STEPS = [
  { key: "delivery", label: "Delivery", icon: <MdLocationOn /> },
  { key: "payment", label: "Payment", icon: <MdCreditCard /> },
  { key: "review", label: "Review", icon: <MdCheckCircle /> },
];

/* ─── Step indicator ─────────────────────────────────────────────────── */
const StepBar = ({ current, onStepClick }) => {
  const [hoveredStep, setHoveredStep] = useState(null);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 40,
      padding: "0 20px",
      position: "relative"
    }}>
      {STEPS.map((step, i) => {
        const isCompleted = i < current;
        const isActive = i === current;
        const isClickable = i <= current;

        return (
          <div
            key={step.key}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              cursor: isClickable ? "pointer" : "default",
              opacity: isClickable ? 1 : 0.5,
              transition: "all 0.3s ease",
              transform: hoveredStep === i ? "translateY(-2px)" : "none"
            }}
            onClick={() => isClickable && onStepClick(i)}
            onMouseEnter={() => setHoveredStep(i)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: isCompleted
                ? "linear-gradient(135deg, #10B981, #059669)"
                : isActive
                  ? "linear-gradient(135deg, #F59E0B, #D97706)"
                  : "rgba(255,255,255,0.05)",
              border: `2px solid ${isCompleted
                ? "#10B981"
                : isActive
                  ? "#F59E0B"
                  : "rgba(255,255,255,0.1)"
                }`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              color: isCompleted || isActive ? "#FFFFFF" : "#6B7280",
              boxShadow: isActive ? "0 0 20px rgba(245,158,11,0.4)" : "none",
              transition: "all 0.3s ease",
              position: "relative",
            }}>
              {isCompleted ? <MdCheck /> : step.icon}
              {isActive && (
                <div style={{
                  position: "absolute",
                  inset: -4,
                  borderRadius: "50%",
                  border: "2px solid rgba(245,158,11,0.3)",
                  animation: "ripple 1.5s ease-out infinite",
                }} />
              )}
            </div>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginTop: 8,
              color: isCompleted
                ? "#10B981"
                : isActive
                  ? "#F59E0B"
                  : "#6B7280",
              transition: "color 0.3s",
            }}>
              {step.label}
            </span>
          </div>
        );
      })}

      {/* Progress line */}
      <div style={{
        position: "absolute",
        top: 24,
        left: 60,
        right: 60,
        height: 2,
        background: "rgba(255,255,255,0.1)",
        zIndex: -1,
      }}>
        <div style={{
          height: "100%",
          background: "linear-gradient(90deg, #10B981, #F59E0B)",
          width: `${(current / (STEPS.length - 1)) * 100}%`,
          transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          borderRadius: 2,
        }} />
      </div>
    </div>
  );
};

/* ─── Input field with modern design ─────────────────────────────────── */
const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required,
  rows,
  icon,
  helper,
  disabled,
  autoComplete,
  maxLength,
  pattern
}) => {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const Tag = rows ? "textarea" : "input";

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8
      }}>
        <label style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: 13,
          color: focused ? "#F59E0B" : "#9CA3AF",
          transition: "color 0.2s",
          display: "flex",
          alignItems: "center",
          gap: 6
        }}>
          {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
          {label}
          {required && <span style={{ color: "#EF4444" }}>*</span>}
        </label>
        {helper && !error && (
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            color: "#6B7280"
          }}>{helper}</span>
        )}
      </div>

      <div style={{
        position: "relative",
        transition: "all 0.2s",
        transform: focused ? "translateY(-1px)" : "none"
      }}>
        <Tag
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          autoComplete={autoComplete}
          maxLength={maxLength}
          pattern={pattern}
          disabled={disabled}
          onFocus={() => {
            setFocused(true);
            setTouched(true);
          }}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: "14px 16px",
            background: disabled
              ? "rgba(255,255,255,0.02)"
              : focused
                ? "rgba(245,158,11,0.03)"
                : "rgba(255,255,255,0.03)",
            border: `1.5px solid ${error && touched
              ? "#EF4444"
              : focused
                ? "#F59E0B"
                : "rgba(255,255,255,0.08)"
              }`,
            borderRadius: 12,
            color: disabled ? "#4B5563" : "#F3F4F6",
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            outline: "none",
            transition: "all 0.2s",
            resize: rows ? "vertical" : "none",
            boxSizing: "border-box",
            minHeight: rows ? rows * 24 : 48,
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? "not-allowed" : "text"
          }}
        />

        {error && touched && (
          <div style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#EF4444",
            fontSize: 18
          }}>
            <MdErrorOutline />
          </div>
        )}
      </div>

      {error && touched && (
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          color: "#EF4444",
          marginTop: 6,
          display: "flex",
          alignItems: "center",
          gap: 4
        }}>
          <MdWarning size={14} />
          {error}
        </div>
      )}
    </div>
  );
};

/* ─── Payment method card ────────────────────────────────────────────── */
const PaymentMethodCard = ({ method, selected, onSelect, icons }) => (
  <button
    onClick={() => onSelect(method.id)}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "18px 20px",
      background: selected
        ? "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))"
        : "rgba(255,255,255,0.03)",
      border: `2px solid ${selected
        ? "#F59E0B"
        : "rgba(255,255,255,0.06)"
        }`,
      borderRadius: 16,
      cursor: "pointer",
      width: "100%",
      transition: "all 0.2s ease",
      position: "relative",
      overflow: "hidden"
    }}
    onMouseEnter={(e) => {
      if (!selected) {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
      }
    }}
    onMouseLeave={(e) => {
      if (!selected) {
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
      }
    }}
  >
    <div style={{
      display: "flex",
      gap: 8,
      alignItems: "center",
      flex: 1
    }}>
      <div style={{
        fontSize: 28,
        color: selected ? "#F59E0B" : "#9CA3AF",
        transition: "color 0.2s",
        display: "flex"
      }}>
        {method.icon}
      </div>
      <div style={{ textAlign: "left" }}>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: selected ? "#FFFFFF" : "#E5E7EB",
          marginBottom: 2
        }}>
          {method.name}
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          color: "#6B7280"
        }}>
          {method.description}
        </div>
      </div>
    </div>

    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8
    }}>
      {icons && (
        <div style={{ display: "flex", gap: 4 }}>
          {icons.map((Icon, idx) => (
            <span key={idx} style={{ fontSize: 20, color: "#6B7280" }}>
              <Icon />
            </span>
          ))}
        </div>
      )}
      <div style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        border: `2px solid ${selected ? "#F59E0B" : "rgba(255,255,255,0.2)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s"
      }}>
        {selected && (
          <div style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#F59E0B"
          }} />
        )}
      </div>
    </div>
  </button>
);

/* ─── Address card ───────────────────────────────────────────────────── */
const AddressCard = ({ address, selected, onSelect, onEdit, onDelete }) => (
  <button
    onClick={() => onSelect(address.id)}
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      padding: "16px 18px",
      background: selected
        ? "rgba(245,158,11,0.08)"
        : "rgba(255,255,255,0.03)",
      border: `2px solid ${selected
        ? "#F59E0B"
        : "rgba(255,255,255,0.06)"
        }`,
      borderRadius: 14,
      cursor: "pointer",
      width: "100%",
      transition: "all 0.2s",
      position: "relative"
    }}
  >
    <div style={{
      width: 40,
      height: 40,
      borderRadius: 12,
      background: selected ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20,
      color: selected ? "#F59E0B" : "#6B7280"
    }}>
      {address.icon}
    </div>

    <div style={{ flex: 1, textAlign: "left" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: selected ? "#FFFFFF" : "#E5E7EB"
        }}>
          {address.label}
        </span>
        {address.isDefault && (
          <span style={{
            background: "rgba(16,185,129,0.15)",
            color: "#10B981",
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 20,
            letterSpacing: "0.3px"
          }}>
            DEFAULT
          </span>
        )}
      </div>
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        color: "#9CA3AF",
        lineHeight: 1.5
      }}>
        {address.line}
      </div>
    </div>

    <div style={{
      display: "flex",
      gap: 8,
      alignItems: "center"
    }}>
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(address);
          }}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "none",
            width: 32,
            height: 32,
            borderRadius: 8,
            color: "#9CA3AF",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#F59E0B";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "#9CA3AF";
          }}
        >
          <MdEdit size={16} />
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(address.id);
          }}
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "none",
            width: 32,
            height: 32,
            borderRadius: 8,
            color: "#EF4444",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
          }}
        >
          <MdDelete size={16} />
        </button>
      )}
    </div>
  </button>
);

/* ─── Coupon input ───────────────────────────────────────────────────── */
const CouponInput = ({ onApply, appliedCoupon }) => {
  const [code, setCode] = useState("");
  const [isValid, setIsValid] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;

    setIsApplying(true);
    // Simulate API call
    setTimeout(() => {
      const coupon = COUPONS.find(c => c.code === code.toUpperCase());
      if (coupon) {
        setIsValid(true);
        onApply(coupon);
      } else {
        setIsValid(false);
      }
      setIsApplying(false);
    }, 1000);
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      borderRadius: 14,
      padding: 16,
      border: "1px solid rgba(255,255,255,0.05)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12
      }}>
        <MdDiscount size={20} color="#F59E0B" />
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: 13,
          color: "#E5E7EB"
        }}>
          Have a coupon?
        </span>
      </div>

      {appliedCoupon ? (
        <div style={{
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: 10,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MdCheckCircle color="#10B981" size={18} />
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              color: "#10B981"
            }}>
              {appliedCoupon.code}
            </span>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: "#6B7280"
            }}>
              {appliedCoupon.type === 'percentage'
                ? `${appliedCoupon.discount}% off`
                : `$${appliedCoupon.discount} off`}
            </span>
          </div>
          <button
            onClick={() => onApply(null)}
            style={{
              background: "none",
              border: "none",
              color: "#9CA3AF",
              cursor: "pointer",
              fontSize: 18,
              padding: 4
            }}
          >
            <MdClose />
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setIsValid(null);
            }}
            placeholder="Enter coupon code"
            style={{
              flex: 1,
              padding: "12px 14px",
              background: "rgba(255,255,255,0.03)",
              border: `1.5px solid ${isValid === false
                ? "#EF4444"
                : "rgba(255,255,255,0.08)"
                }`,
              borderRadius: 10,
              color: "#F3F4F6",
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              outline: "none",
              transition: "all 0.2s"
            }}
          />
          <button
            onClick={handleApply}
            disabled={isApplying || !code.trim()}
            style={{
              padding: "0 20px",
              background: isApplying
                ? "rgba(245,158,11,0.3)"
                : "linear-gradient(135deg, #F59E0B, #D97706)",
              border: "none",
              borderRadius: 10,
              color: "#1C1917",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              cursor: isApplying ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: !code.trim() ? 0.5 : 1
            }}
          >
            {isApplying ? "..." : "Apply"}
          </button>
        </div>
      )}

      {isValid === false && (
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          color: "#EF4444",
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 4
        }}>
          <MdWarning size={14} />
          Invalid coupon code
        </div>
      )}
    </div>
  );
};

/* ─── Order timeline ─────────────────────────────────────────────────── */
const OrderTimeline = ({ estimatedTime = 25 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => Math.min(100, p + 1));
    }, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const stages = [
    { label: "Order Received", time: "0 min", icon: <MdCheckCircle /> },
    { label: "Preparing", time: "5 min", icon: <MdRestaurant /> },
    { label: "Quality Check", time: "15 min", icon: <MdVerified /> },
    { label: "Out for Delivery", time: "20 min", icon: <MdLocalShipping /> },
    { label: "Delivered", time: `${estimatedTime} min`, icon: <MdCelebration /> },
  ];

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      borderRadius: 16,
      padding: 20,
      border: "1px solid rgba(255,255,255,0.05)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 20
      }}>
        <MdSchedule size={20} color="#F59E0B" />
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          color: "#E5E7EB"
        }}>
          Estimated Delivery: {estimatedTime} minutes
        </span>
      </div>

      <div style={{ position: "relative", marginBottom: 30 }}>
        <div style={{
          position: "absolute",
          top: 12,
          left: 0,
          right: 0,
          height: 2,
          background: "rgba(255,255,255,0.1)",
          zIndex: 1
        }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #10B981, #F59E0B)",
            transition: "width 1s ease",
            borderRadius: 2
          }} />
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 2
        }}>
          {stages.map((stage, index) => (
            <div key={index} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 60
            }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: progress >= (index * 25)
                  ? "linear-gradient(135deg, #10B981, #059669)"
                  : "rgba(255,255,255,0.05)",
                border: `2px solid ${progress >= (index * 25)
                  ? "#10B981"
                  : "rgba(255,255,255,0.1)"
                  }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: progress >= (index * 25) ? "#FFFFFF" : "#6B7280",
                marginBottom: 8
              }}>
                {progress >= (index * 25) ? <MdCheck /> : index + 1}
              </div>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: "#6B7280",
                textAlign: "center"
              }}>
                {stage.label}
              </span>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 9,
                color: "#4B5563",
                marginTop: 2
              }}>
                {stage.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Order summary sidebar ──────────────────────────────────────────── */
const OrderSummary = ({
  items,
  subtotal,
  delivery,
  discount,
  total,
  onEditCart,
  appliedCoupon
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{
      background: "#111827",
      borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.05)",
      overflow: "hidden",
      position: "sticky",
      top: 84,
      boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 22px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer"
      }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#FFFFFF"
          }}>
            Your Order
          </span>
          <span style={{
            background: "#F59E0B",
            color: "#1C1917",
            borderRadius: 20,
            padding: "2px 8px",
            fontSize: 12,
            fontWeight: 600
          }}>
            {items.length} items
          </span>
        </div>
        <button style={{
          background: "none",
          border: "none",
          color: "#6B7280",
          cursor: "pointer",
          transform: expanded ? "rotate(180deg)" : "none",
          transition: "transform 0.3s"
        }}>
          <MdArrowBack style={{ transform: "rotate(90deg)" }} />
        </button>
      </div>

      {/* Items */}
      {expanded && (
        <div style={{
          padding: "20px 22px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          maxHeight: 300,
          overflowY: "auto"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: 12 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(245,158,11,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  color: "#F59E0B",
                  flexShrink: 0
                }}>
                  {item.icon || <MdFastfood />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4
                  }}>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#FFFFFF"
                    }}>
                      {item.quantity > 1 && `${item.quantity}× `}
                      {item.name}
                    </span>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#F59E0B"
                    }}>
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {item.customizations?.addons?.length > 0 && (
                    <div style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      color: "#6B7280",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 4
                    }}>
                      {item.customizations.addons.map((addon, i) => (
                        <span key={i} style={{
                          background: "rgba(255,255,255,0.05)",
                          padding: "2px 8px",
                          borderRadius: 12
                        }}>
                          + {addon}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {onEditCart && (
            <button
              onClick={onEditCart}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "10px",
                background: "rgba(255,255,255,0.03)",
                border: "1px dashed rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#9CA3AF",
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "#F59E0B";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.color = "#9CA3AF";
              }}
            >
              Edit Cart
            </button>
          )}
        </div>
      )}

      {/* Pricing */}
      <div style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9CA3AF" }}>
              Subtotal
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color: "#E5E7EB" }}>
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9CA3AF" }}>
              Delivery Fee
            </span>
            {delivery === 0 ? (
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 13,
                color: "#10B981",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}>
                FREE <MdCelebration size={14} />
              </span>
            ) : (
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color: "#E5E7EB" }}>
                ${delivery.toFixed(2)}
              </span>
            )}
          </div>

          {discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#10B981",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}>
                Discount <MdDiscount size={14} />
              </span>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 13,
                color: "#10B981"
              }}>
                -${discount.toFixed(2)}
              </span>
            </div>
          )}

          {appliedCoupon && (
            <div style={{
              background: "rgba(16,185,129,0.05)",
              borderRadius: 8,
              padding: "8px 10px",
              marginTop: 4
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  color: "#10B981"
                }}>
                  Coupon: {appliedCoupon.code}
                </span>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  color: "#9CA3AF"
                }}>
                  -${appliedCoupon.type === 'percentage'
                    ? ((subtotal * appliedCoupon.discount) / 100).toFixed(2)
                    : appliedCoupon.discount}
                </span>
              </div>
            </div>
          )}

          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            marginTop: 8,
            paddingTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "#FFFFFF"
            }}>
              Total
            </span>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              fontSize: 24,
              color: "#F59E0B"
            }}>
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "12px 0",
          borderTop: "1px solid rgba(255,255,255,0.05)"
        }}>
          {[
            { icon: <MdLock />, text: "256-bit SSL secure checkout" },
            { icon: <MdSecurity />, text: "Your data is encrypted" },
            { icon: <MdVerified />, text: "100% money-back guarantee" },
          ].map((badge, idx) => (
            <div key={idx} style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              color: "#6B7280"
            }}>
              <span style={{ fontSize: 14, color: "#9CA3AF" }}>{badge.icon}</span>
              {badge.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Success Screen ─────────────────────────────────────────────────── */
const SuccessScreen = ({ orderId, onClose }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => Math.min(100, p + 1));
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "40px 20px",
      animation: "fadeSlideUp 0.5s ease"
    }}>
      {/* Success animation */}
      <div style={{
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #10B981, #059669)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        animation: "bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }}>
        <MdCheck size={50} color="#FFFFFF" />
      </div>

      <h1 style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 800,
        fontSize: "clamp(32px, 5vw, 48px)",
        color: "#10B981",
        marginBottom: 12,
        letterSpacing: "-0.02em"
      }}>
        Order Confirmed!
      </h1>

      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 16,
        color: "#9CA3AF",
        maxWidth: 500,
        marginBottom: 24,
        lineHeight: 1.6
      }}>
        Thank you for your order. We've sent a confirmation to your email and will notify you when your food is on the way.
      </p>

      {/* Order ID card */}
      <div style={{
        background: "rgba(245,158,11,0.1)",
        border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: 16,
        padding: "20px 32px",
        marginBottom: 32
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          color: "#9CA3AF",
          letterSpacing: "0.5px",
          marginBottom: 6,
          textTransform: "uppercase"
        }}>
          Order Number
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 800,
          fontSize: 28,
          color: "#F59E0B",
          letterSpacing: "1px"
        }}>
          {orderId}
        </div>
      </div>

      {/* Progress to tracking */}
      <div style={{ width: 300, marginBottom: 32 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          color: "#6B7280"
        }}>
          <span>Order placed</span>
          <span>Redirecting to tracking</span>
        </div>
        <div style={{
          height: 4,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 2,
          overflow: "hidden"
        }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #F59E0B, #10B981)",
            transition: "width 0.03s linear",
            borderRadius: 2
          }} />
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => navigate(`/order/${orderId}`)}
          style={{
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            border: "none",
            borderRadius: 12,
            padding: "14px 28px",
            color: "#1C1917",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 10px 25px rgba(245,158,11,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <MdDeliveryDining size={18} />
          Track Order
        </button>

        <button
          onClick={() => navigate('/menu')}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "14px 28px",
            color: "#E5E7EB",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

/* ─── MAIN CHECKOUT PAGE ─────────────────────────────────────────────── */
export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Debug authentication status
  useEffect(() => {
    console.log('CheckoutPage - User:', user);
    console.log('CheckoutPage - Token:', token);
    console.log('CheckoutPage - Token in localStorage:', localStorage.getItem('token'));
  }, [user, token]);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [errors, setErrors] = useState({});

  // Form states
  const [deliveryInfo, setDeliveryInfo] = useState({
    selectedAddress: 1,
    useCustomAddress: false,
    customAddress: "",
    instructions: "",
    contactName: user?.name || "",
    contactPhone: user?.phone || "",
    contactEmail: user?.email || "",
  });

  const [paymentInfo, setPaymentInfo] = useState({
    method: "card",
    cardDetails: {
      name: "",
      number: "",
      expiry: "",
      cvv: ""
    }
  });

  // Calculate totals
  const items = cartItems.length > 0 ? cartItems : [];
  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const delivery = subtotal >= 20 ? 0 : 3.99;
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? (subtotal * appliedCoupon.discount) / 100
      : appliedCoupon.discount
    : 0;
  const total = Math.max(0, subtotal + delivery - discount);

  // Validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) { // Delivery step
      if (!deliveryInfo.contactName.trim()) {
        newErrors.contactName = "Name is required";
      }
      if (!deliveryInfo.contactPhone.trim()) {
        newErrors.contactPhone = "Phone number is required";
      } else if (!/^\d{10,}$/.test(deliveryInfo.contactPhone.replace(/\D/g, ''))) {
        newErrors.contactPhone = "Invalid phone number";
      }
      if (!deliveryInfo.contactEmail.trim()) {
        newErrors.contactEmail = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryInfo.contactEmail)) {
        newErrors.contactEmail = "Invalid email";
      }
      if (deliveryInfo.useCustomAddress && !deliveryInfo.customAddress.trim()) {
        newErrors.customAddress = "Address is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep(s => Math.max(s - 1, 0));
  };

  const handleStepClick = (step) => {
    if (step <= currentStep) {
      setDirection(step > currentStep ? 1 : -1);
      setCurrentStep(step);
    }
  };

  const handlePlaceOrder = async (paymentData = null) => {
    console.log('=== ORDER PLACEMENT DEBUG ===');
    console.log('User:', user);
    console.log('Token:', token ? token.substring(0, 20) + '...' : 'null');
    console.log('Token from localStorage:', localStorage.getItem('token') ? 'exists' : 'null');
    console.log('API_BASE:', API_BASE);

    if (!user || !token) {
      console.error('Authentication failed - user or token is missing');
      toast.error('You must be logged in to place an order. Please log in and try again.');
      navigate('/login');
      return;
    }

    // Double-check token is set in axios
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      console.error('No token found in localStorage');
      toast.error('Authentication error. Please log in again.');
      navigate('/login');
      return;
    }

    // Ensure axios has the token
    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    console.log('Authorization header set for axios');

    // Test API connectivity
    try {
      console.log('Testing API connectivity...');
      await axios.get(`${API_BASE}/api/products`);
      console.log('API connectivity test passed');
    } catch (testError) {
      console.error('API connectivity test failed:', testError.message);
      toast.error('Server connection error. Please try again later.');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Please add items before placing an order.');
      return;
    }



    setLoading(true);

    try {
      // Prepare order items from cart - map to backend format
      const orderItems = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        customizations: item.customizations || {}
      }));
      console.log('Cart items:', cartItems);
      console.log('Order items prepared:', orderItems);

      // Prepare delivery address string
      const deliveryAddress = deliveryInfo.useCustomAddress
        ? deliveryInfo.customAddress
        : `${SAVED_ADDRESSES.find(a => a.id === deliveryInfo.selectedAddress)?.line || ''}`;
      console.log('Delivery info:', deliveryInfo);
      console.log('Delivery address constructed:', deliveryAddress);

      // Determine payment method
      const paymentMethod = paymentInfo.method === 'card' ? 'stripe' : 'cash';

      // Create order via API (Authorization header is set globally by AuthContext)
      const orderData = {
        items: orderItems,
        delivery_address: deliveryAddress,
        delivery_instructions: deliveryInfo.instructions || '',
        payment_method: paymentMethod,
        subtotal: subtotal,
        delivery_fee: delivery,
        discount_amount: discount,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        // If Stripe payment, include payment intent ID
        ...(paymentData && {
          stripe_payment_intent_id: paymentData.paymentIntentId || paymentData.id
        })
      };
      console.log('Sending order data:', orderData);
      console.log('API URL:', `${API_BASE}/api/orders`);
      console.log('Axios default headers:', axios.defaults.headers);
      console.log('Axios common headers:', axios.defaults.headers.common);

      const response = await axios.post(`${API_BASE}/api/orders`, orderData);

      if (response.data.success) {
        const order = response.data.data;
        setOrderId(order.order_number);
        setSuccess(true);
        // Clear cart after order creation (for cash payments, or as backup for card payments)
        clearCart();
        console.log('Cart cleared after successful order creation');
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error("Order failed:", error);
      console.error("Error response:", error.response);

      // Handle XMLHttpRequest errors
      if (error.message && error.message.includes('responseText')) {
        console.warn("XMLHttpRequest responseText error - this may be caused by browser devtools");
        alert("Network error occurred. Please try again or refresh the page.");
        return;
      }

      const errorMessage = error.response?.data?.message || error.message || "Failed to place order. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSuccess = (paymentData) => {
    // Payment was successful - clear cart immediately since payment is confirmed
    console.log('Stripe payment successful, clearing cart immediately');
    clearCart();

    // Now create the order (cart is already cleared)
    handlePlaceOrder(paymentData);
  };

  if (success) {
    return (
      <>
        <FontLink />
        <style>{globalStyles}</style>
        <div style={{ background: "#0C0A09", minHeight: "100vh" }}>
          <SuccessScreen orderId={orderId} onClose={() => navigate('/menu')} />
        </div>
      </>
    );
  }

  return (
    <>
      <FontLink />
      <style>{globalStyles}</style>

      <div style={{
        background: "radial-gradient(circle at 0% 0%, #1F1A17, #0C0A09)",
        minHeight: "100vh",
        color: "#FFFFFF"
      }}>
        {/* Header */}
        <div style={{
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "30px 40px 20px",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(12,10,9,0.8)"
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20
            }}>
              <h1 style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(28px, 4vw, 36px)",
                background: "linear-gradient(135deg, #FFFFFF, #E5E7EB)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em"
              }}>
                Checkout
              </h1>
              <button
                onClick={() => navigate('/cart')}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "8px 16px",
                  color: "#9CA3AF",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <MdArrowBack />
                Back to Cart
              </button>
            </div>

            <StepBar current={currentStep} onStepClick={handleStepClick} />
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 40px" }}>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>

            {/* Left: Forms */}
            <div style={{ flex: 1, minWidth: 320 }}>
              <div style={{
                animation: direction > 0 ? "slideInRight" : "slideInLeft",
                animationDuration: "0.35s",
                animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
              }}>
                {/* Step 0: Delivery */}
                {currentStep === 0 && (
                  <div>
                    <div style={{ marginBottom: 24 }}>
                      <h2 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: 18,
                        color: "#FFFFFF",
                        marginBottom: 6
                      }}>
                        Delivery Details
                      </h2>
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        color: "#6B7280"
                      }}>
                        Where should we deliver your order?
                      </p>
                    </div>

                    {/* Contact Info */}
                    <div style={{
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: 16,
                      padding: 24,
                      marginBottom: 24,
                      border: "1px solid rgba(255,255,255,0.05)"
                    }}>
                      <h3 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#E5E7EB",
                        marginBottom: 16
                      }}>
                        Contact Information
                      </h3>

                      <InputField
                        label="Full Name"
                        value={deliveryInfo.contactName}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, contactName: e.target.value })}
                        error={errors.contactName}
                        required
                        icon={<MdPerson />}
                        placeholder="John Doe"
                      />

                      <InputField
                        label="Phone Number"
                        type="tel"
                        value={deliveryInfo.contactPhone}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, contactPhone: e.target.value })}
                        error={errors.contactPhone}
                        required
                        icon={<MdPhone />}
                        placeholder="+1 234 567 8900"
                        helper="For delivery updates"
                      />

                      <InputField
                        label="Email Address"
                        type="email"
                        value={deliveryInfo.contactEmail}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, contactEmail: e.target.value })}
                        error={errors.contactEmail}
                        required
                        icon={<MdEmail />}
                        placeholder="john@example.com"
                        helper="Order confirmation will be sent here"
                      />
                    </div>

                    {/* Address Selection */}
                    <div style={{
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: 16,
                      padding: 24,
                      marginBottom: 24,
                      border: "1px solid rgba(255,255,255,0.05)"
                    }}>
                      <h3 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#E5E7EB",
                        marginBottom: 16
                      }}>
                        Delivery Address
                      </h3>

                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {SAVED_ADDRESSES.map(addr => (
                          <AddressCard
                            key={addr.id}
                            address={addr}
                            selected={!deliveryInfo.useCustomAddress && deliveryInfo.selectedAddress === addr.id}
                            onSelect={() => setDeliveryInfo({
                              ...deliveryInfo,
                              selectedAddress: addr.id,
                              useCustomAddress: false
                            })}
                          />
                        ))}

                        <button
                          onClick={() => setDeliveryInfo({
                            ...deliveryInfo,
                            useCustomAddress: !deliveryInfo.useCustomAddress
                          })}
                          style={{
                            padding: "14px",
                            background: deliveryInfo.useCustomAddress
                              ? "rgba(245,158,11,0.08)"
                              : "rgba(255,255,255,0.03)",
                            border: `2px dashed ${deliveryInfo.useCustomAddress
                              ? "#F59E0B"
                              : "rgba(255,255,255,0.1)"
                              }`,
                            borderRadius: 14,
                            color: deliveryInfo.useCustomAddress ? "#F59E0B" : "#9CA3AF",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            transition: "all 0.2s"
                          }}
                        >
                          {deliveryInfo.useCustomAddress ? (
                            <>
                              <MdClose size={16} />
                              Use saved address
                            </>
                          ) : (
                            <>
                              <MdAdd size={16} />
                              Add new address
                            </>
                          )}
                        </button>

                        {deliveryInfo.useCustomAddress && (
                          <div style={{ animation: "fadeIn 0.3s ease" }}>
                            <InputField
                              label="New Address"
                              value={deliveryInfo.customAddress}
                              onChange={(e) => setDeliveryInfo({ ...deliveryInfo, customAddress: e.target.value })}
                              error={errors.customAddress}
                              required
                              rows={3}
                              placeholder="Enter your full address"
                            />
                          </div>
                        )}
                      </div>

                      <InputField
                        label="Delivery Instructions (optional)"
                        value={deliveryInfo.instructions}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, instructions: e.target.value })}
                        rows={2}
                        placeholder="e.g., Ring bell twice, leave at door, gate code: 1234"
                      />
                    </div>

                    {/* Order Timeline Preview */}
                    <OrderTimeline estimatedTime={25} />
                  </div>
                )}

                {/* Step 1: Payment */}
                {currentStep === 1 && (
                  <div>
                    <div style={{ marginBottom: 24 }}>
                      <h2 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: 18,
                        color: "#FFFFFF",
                        marginBottom: 6
                      }}>
                        Payment Method
                      </h2>
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        color: "#6B7280"
                      }}>
                        Choose how you'd like to pay
                      </p>
                    </div>

                    <div style={{
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: 16,
                      padding: 24,
                      border: "1px solid rgba(255,255,255,0.05)"
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <PaymentMethodCard
                          method={{
                            id: "card",
                            name: "Credit / Debit Card",
                            description: "Pay securely with your card",
                            icon: <MdCreditCard />
                          }}
                          icons={[SiVisa, SiMastercard, SiAmericanexpress]}
                          selected={paymentInfo.method === "card"}
                          onSelect={(id) => setPaymentInfo({ ...paymentInfo, method: id })}
                        />

                        <PaymentMethodCard
                          method={{
                            id: "paypal",
                            name: "PayPal",
                            description: "Fast & secure with PayPal",
                            icon: <FaPaypal />
                          }}
                          selected={paymentInfo.method === "paypal"}
                          onSelect={(id) => setPaymentInfo({ ...paymentInfo, method: id })}
                        />

                        <PaymentMethodCard
                          method={{
                            id: "apple",
                            name: "Apple Pay",
                            description: "Pay with Touch ID / Face ID",
                            icon: <FaApple />
                          }}
                          selected={paymentInfo.method === "apple"}
                          onSelect={(id) => setPaymentInfo({ ...paymentInfo, method: id })}
                        />

                        <PaymentMethodCard
                          method={{
                            id: "google",
                            name: "Google Pay",
                            description: "Fast checkout with Google",
                            icon: <FaGooglePay />
                          }}
                          selected={paymentInfo.method === "google"}
                          onSelect={(id) => setPaymentInfo({ ...paymentInfo, method: id })}
                        />

                        <PaymentMethodCard
                          method={{
                            id: "cash",
                            name: "Cash on Delivery",
                            description: "Pay when you receive your order",
                            icon: <MdAttachMoney />
                          }}
                          selected={paymentInfo.method === "cash"}
                          onSelect={(id) => setPaymentInfo({ ...paymentInfo, method: id })}
                        />
                      </div>

                      {/* Stripe Card Element */}
                      {paymentInfo.method === "card" && (
                        <div style={{ marginTop: 24 }}>
                          <StripePayment
                            items={items}
                            subtotal={subtotal}
                            delivery={delivery}
                            total={total}
                            onSuccess={handleStripeSuccess}
                          />
                        </div>
                      )}

                      {paymentInfo.method === "cash" && (
                        <div style={{
                          marginTop: 24,
                          padding: "16px 20px",
                          background: "rgba(16,185,129,0.05)",
                          border: "1px solid rgba(16,185,129,0.1)",
                          borderRadius: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 12
                        }}>
                          <MdInfoOutline size={24} color="#10B981" />
                          <div>
                            <div style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 600,
                              fontSize: 13,
                              color: "#10B981",
                              marginBottom: 4
                            }}>
                              Cash on Delivery
                            </div>
                            <div style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 12,
                              color: "#9CA3AF"
                            }}>
                              Please have the exact amount ready. Our driver will collect payment upon delivery.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Review */}
                {currentStep === 2 && (
                  <div>
                    <div style={{ marginBottom: 24 }}>
                      <h2 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: 18,
                        color: "#FFFFFF",
                        marginBottom: 6
                      }}>
                        Review Your Order
                      </h2>
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        color: "#6B7280"
                      }}>
                        Please confirm your order details
                      </p>
                    </div>

                    <div style={{
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: 16,
                      padding: 24,
                      border: "1px solid rgba(255,255,255,0.05)"
                    }}>
                      {/* Order items summary */}
                      <div style={{ marginBottom: 24 }}>
                        <h3 style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#E5E7EB",
                          marginBottom: 16
                        }}>
                          Items
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {items.map((item, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 13,
                                color: "#9CA3AF"
                              }}>
                                {item.quantity}× {item.name}
                                {item.customizations?.addons?.length > 0 && (
                                  <span style={{ color: "#6B7280", fontSize: 11, marginLeft: 4 }}>
                                    ({item.customizations.addons.join(", ")})
                                  </span>
                                )}
                              </span>
                              <span style={{
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 600,
                                fontSize: 13,
                                color: "#FFFFFF"
                              }}>
                                ${(Number(item.price) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery details */}
                      <div style={{ marginBottom: 24 }}>
                        <h3 style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#E5E7EB",
                          marginBottom: 12
                        }}>
                          Delivery To
                        </h3>
                        <div style={{
                          padding: 12,
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 10
                        }}>
                          <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 13,
                            color: "#D1D5DB",
                            marginBottom: 4
                          }}>
                            {deliveryInfo.useCustomAddress
                              ? deliveryInfo.customAddress
                              : SAVED_ADDRESSES.find(a => a.id === deliveryInfo.selectedAddress)?.line}
                          </p>
                          {deliveryInfo.instructions && (
                            <p style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 12,
                              color: "#6B7280",
                              fontStyle: "italic"
                            }}>
                              "{deliveryInfo.instructions}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Payment details */}
                      <div style={{ marginBottom: 24 }}>
                        <h3 style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#E5E7EB",
                          marginBottom: 12
                        }}>
                          Payment Method
                        </h3>
                        <div style={{
                          padding: 12,
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 8
                        }}>
                          <span style={{ fontSize: 20 }}>
                            {paymentInfo.method === "card" && <MdCreditCard />}
                            {paymentInfo.method === "paypal" && <FaPaypal />}
                            {paymentInfo.method === "apple" && <FaApple />}
                            {paymentInfo.method === "google" && <FaGooglePay />}
                            {paymentInfo.method === "cash" && <MdAttachMoney />}
                          </span>
                          <span style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 13,
                            color: "#D1D5DB"
                          }}>
                            {paymentInfo.method === "card" && "Credit / Debit Card"}
                            {paymentInfo.method === "paypal" && "PayPal"}
                            {paymentInfo.method === "apple" && "Apple Pay"}
                            {paymentInfo.method === "google" && "Google Pay"}
                            {paymentInfo.method === "cash" && "Cash on Delivery"}
                          </span>
                        </div>
                      </div>

                      {/* Coupon section */}
                      <CouponInput
                        onApply={setAppliedCoupon}
                        appliedCoupon={appliedCoupon}
                      />

                      {/* Price breakdown */}
                      <div style={{
                        marginTop: 24,
                        padding: 16,
                        background: "rgba(245,158,11,0.05)",
                        borderRadius: 12
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9CA3AF" }}>Subtotal</span>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#E5E7EB" }}>${subtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9CA3AF" }}>Delivery</span>
                          {delivery === 0 ? (
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#10B981" }}>FREE</span>
                          ) : (
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#E5E7EB" }}>${delivery.toFixed(2)}</span>
                          )}
                        </div>
                        {discount > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#10B981" }}>Discount</span>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#10B981" }}>-${discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div style={{
                          borderTop: "1px solid rgba(255,255,255,0.1)",
                          marginTop: 8,
                          paddingTop: 12,
                          display: "flex",
                          justifyContent: "space-between"
                        }}>
                          <span style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 700,
                            fontSize: 15,
                            color: "#FFFFFF"
                          }}>Total</span>
                          <span style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 800,
                            fontSize: 22,
                            color: "#F59E0B"
                          }}>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 28
                }}>
                  {currentStep > 0 && (
                    <button
                      onClick={handleBack}
                      style={{
                        flex: 1,
                        padding: "14px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        color: "#9CA3AF",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.color = "#E5E7EB";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.color = "#9CA3AF";
                      }}
                    >
                      <MdArrowBack />
                      Back
                    </button>
                  )}

                  {currentStep < STEPS.length - 1 ? (
                    <button
                      onClick={handleNext}
                      style={{
                        flex: currentStep === 0 ? 1 : 2,
                        padding: "14px",
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        border: "none",
                        borderRadius: 12,
                        color: "#1C1917",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.2s",
                        boxShadow: "0 4px 15px rgba(245,158,11,0.2)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(245,158,11,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(245,158,11,0.2)";
                      }}
                    >
                      Continue
                      <MdArrowForward />
                    </button>
                  ) : (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading || cartItems.length === 0}
                      style={{
                        flex: 3,
                        padding: "16px",
                        background: loading
                          ? "rgba(245,158,11,0.3)"
                          : "linear-gradient(135deg, #F59E0B, #D97706)",
                        border: "none",
                        borderRadius: 12,
                        color: "#1C1917",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.2s",
                        boxShadow: loading ? "none" : "0 4px 20px rgba(245,158,11,0.3)",
                        opacity: loading ? 0.6 : 1
                      }}
                    >
                      {loading ? (
                        <>
                          <span style={{ animation: "spin 1s linear infinite" }}>⌛</span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <MdFastfood size={18} />
                          Place Order
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Terms */}
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  color: "#4B5563",
                  marginTop: 20,
                  textAlign: "center"
                }}>
                  By placing your order, you agree to our{" "}
                  <span style={{ color: "#6B7280", textDecoration: "underline", cursor: "pointer" }}>
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span style={{ color: "#6B7280", textDecoration: "underline", cursor: "pointer" }}>
                    Privacy Policy
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div style={{ width: 360, flexShrink: 0 }}>
              <OrderSummary
                items={items}
                subtotal={subtotal}
                delivery={delivery}
                discount={discount}
                total={total}
                appliedCoupon={appliedCoupon}
                onEditCart={() => navigate('/cart')}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Global styles ──────────────────────────────────────────────────── */
const globalStyles = `
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: #0C0A09;
    font-family: 'Inter', sans-serif;
  }

  @keyframes ripple {
    0% {
      opacity: 0.6;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(1.8);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(24px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-24px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes bounce {
    0% {
      transform: scale(0);
    }
    60% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  input::placeholder, textarea::placeholder {
    color: #4B5563;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.03);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    transition: background 0.2s;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.2);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .checkout-summary {
      display: none;
    }
  }
`;