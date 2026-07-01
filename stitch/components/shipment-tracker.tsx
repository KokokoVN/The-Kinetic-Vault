"use client";

import { useState, useEffect, useRef } from "react";
import { trackOrder, type TrackingOrder } from "@/lib/tracking-api";

/* ─── STATUS CONFIG ─── */
const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  CREATED:          { label: "Đã tạo đơn",           color: "#818cf8", bg: "rgba(129,140,248,.12)", icon: "note_add" },
  CONFIRMED:        { label: "Đã xác nhận",           color: "#a78bfa", bg: "rgba(167,139,250,.12)", icon: "check_circle" },
  PAYMENT_EXPECTED: { label: "Chờ thanh toán",         color: "#fbbf24", bg: "rgba(251,191,36,.12)",  icon: "payments" },
  PAID:             { label: "Đã thanh toán",          color: "#34d399", bg: "rgba(52,211,153,.12)",  icon: "paid" },
  PROCESSING:       { label: "Đang xử lý",            color: "#38bdf8", bg: "rgba(56,189,248,.12)",  icon: "sync" },
  PACKING:          { label: "Đang đóng gói",         color: "#a78bfa", bg: "rgba(167,139,250,.12)", icon: "inventory_2" },
  READY_TO_SHIP:    { label: "Sẵn sàng giao",         color: "#818cf8", bg: "rgba(129,140,248,.12)", icon: "package_2" },
  SHIPPED:          { label: "Đã giao cho ĐVVC",      color: "#38bdf8", bg: "rgba(56,189,248,.12)",  icon: "local_shipping" },
  OUT_FOR_DELIVERY: { label: "Đang giao hàng",        color: "#fbbf24", bg: "rgba(251,191,36,.12)",  icon: "delivery_truck_speed" },
  DELIVERY_FAILED:  { label: "Giao hàng thất bại",    color: "#f87171", bg: "rgba(248,113,113,.12)", icon: "error" },
  RESCHEDULED:      { label: "Đã lên lịch lại",       color: "#fbbf24", bg: "rgba(251,191,36,.12)",  icon: "event_repeat" },
  REFUSED:          { label: "Khách từ chối nhận",     color: "#f87171", bg: "rgba(248,113,113,.12)", icon: "block" },
  RETURNING:        { label: "Đang trả hàng",         color: "#fb923c", bg: "rgba(251,146,60,.12)",  icon: "assignment_return" },
  RETURNED:         { label: "Đã hoàn hàng",          color: "#94a3b8", bg: "rgba(148,163,184,.12)", icon: "undo" },
  DELIVERED:        { label: "Giao hàng thành công",   color: "#34d399", bg: "rgba(52,211,153,.12)",  icon: "check_box" },
  CANCELLED:        { label: "Đã hủy",                color: "#f87171", bg: "rgba(248,113,113,.12)", icon: "cancel" },
};

const STEPS = [
  { key: "CREATED",          label: "Đặt hàng",       desc: "Đơn đã được ghi nhận",          icon: "note_add" },
  { key: "CONFIRMED",        label: "Xác nhận",       desc: "Cửa hàng đã xác nhận",         icon: "verified" },
  { key: "PROCESSING",       label: "Xử lý",          desc: "Đang đóng gói đơn hàng",        icon: "inventory_2" },
  { key: "SHIPPED",          label: "Vận chuyển",     desc: "Đã giao cho đơn vị vận chuyển", icon: "local_shipping" },
  { key: "OUT_FOR_DELIVERY", label: "Đang giao",      desc: "Shipper đang trên đường",       icon: "two_wheeler" },
  { key: "DELIVERED",        label: "Hoàn tất",       desc: "Giao hàng thành công",          icon: "package_2" },
];
const STEP_KEYS = STEPS.map(s => s.key);

function stepIndex(status: string): number {
  const s = (status ?? "").toUpperCase();
  if (["CANCELLED","DELIVERY_FAILED","REFUSED","RETURNING","RETURNED"].includes(s)) return -1;
  const i = STEP_KEYS.indexOf(s);
  if (i >= 0) return i;
  if (s === "PAID" || s === "PAYMENT_EXPECTED") return 0;
  if (s === "PACKING" || s === "READY_TO_SHIP") return 3;
  if (s === "RESCHEDULED") return 4;
  return 0;
}

function fmtDate(v: string | number[] | null | undefined): string {
  if (!v) return "—";
  if (typeof v === "string") { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }); }
  if (Array.isArray(v) && v.length >= 3) return new Date(+v[0], +v[1]-1, +v[2]).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  return "—";
}
function fmtVnd(v: number | null | undefined): string {
  if (v == null || !isFinite(v)) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);
}
function imgUrl(raw: string | null | undefined): string {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v) || v.startsWith("data:")) return v;
  const o = "http://localhost:8900";
  return v.startsWith("/") ? `${o}${v}` : `${o}/api/catalog/admin/products/images/file/${v}`;
}

/* ─── CSS KEYFRAMES ─── */
const STYLES = `
@keyframes tracker-fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes tracker-scale-in {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes tracker-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes tracker-pulse-ring {
  0%   { transform: scale(1);   opacity: 1; }
  100% { transform: scale(1.8); opacity: 0; }
}
@keyframes tracker-slide-right {
  from { width: 0; }
}
@keyframes tracker-check-pop {
  0%   { transform: scale(0) rotate(-45deg); }
  50%  { transform: scale(1.2) rotate(0deg); }
  100% { transform: scale(1) rotate(0deg); }
}
.tr-fade-in  { animation: tracker-fade-in 0.6s cubic-bezier(0.16,1,0.3,1) both; }
.tr-scale-in { animation: tracker-scale-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
.tr-d1 { animation-delay: 0.1s; }
.tr-d2 { animation-delay: 0.2s; }
.tr-d3 { animation-delay: 0.3s; }
.tr-d4 { animation-delay: 0.4s; }
`;

export function ShipmentTracker() {
  const [mvd, setMvd] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [showResult, setShowResult] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setOrder(null); setShowResult(false); setLoading(true);
    try {
      const r = await trackOrder(mvd, phone);
      if (r.ok) { setOrder(r.order); setTimeout(() => setShowResult(true), 100); }
      else setError(r.error);
    } catch { setError("Đã xảy ra lỗi kết nối."); }
    finally { setLoading(false); }
  }

  const si = order ? (STATUS_MAP[(order.status??"").toUpperCase()] ?? { label: order.status, color: "#94a3b8", bg: "rgba(148,163,184,.12)", icon: "help" }) : null;
  const progress = order ? stepIndex(order.status) : 0;
  const isFailed = progress < 0;

  return (
    <>
      <style>{STYLES}</style>

      {/* ═══════ SEARCH FORM ═══════ */}
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="tr-fade-in"
          style={{
            position: "relative",
            borderRadius: 28,
            padding: "36px 32px 32px",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(24px) saturate(1.8)",
            WebkitBackdropFilter: "blur(24px) saturate(1.8)",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 8px 40px rgba(99,102,241,0.08), 0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* Top accent line */}
          <div style={{
            position: "absolute", top: 0, left: 32, right: 32, height: 3, borderRadius: "0 0 3px 3px",
            background: "linear-gradient(90deg,#818cf8,#a78bfa,#c084fc)",
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* MVD Input */}
            <div>
              <label htmlFor="t-mvd" style={{
                display: "block", marginBottom: 8, fontSize: 12, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748b",
              }}>
                Mã vận đơn
              </label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  color: "#94a3b8", transition: "color 0.2s",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>qr_code_scanner</span>
                </div>
                <input
                  id="t-mvd" type="text" value={mvd} onChange={e => setMvd(e.target.value)}
                  placeholder="VD: MVD8A2C4F1E03"
                  autoComplete="off"
                  style={{
                    width: "100%", padding: "14px 16px 14px 48px", fontSize: 14, fontWeight: 600,
                    borderRadius: 16, border: "2px solid #f1f5f9", background: "#f8fafc",
                    color: "#0f172a", outline: "none", transition: "all 0.2s",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#818cf8"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(129,140,248,0.1)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <label htmlFor="t-phone" style={{
                display: "block", marginBottom: 8, fontSize: 12, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748b",
              }}>
                4 số cuối điện thoại
              </label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  color: "#94a3b8", transition: "color 0.2s",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>phone_iphone</span>
                </div>
                <input
                  id="t-phone" type="text" value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="VD: 1234" maxLength={4}
                  autoComplete="off"
                  style={{
                    width: "100%", padding: "14px 16px 14px 48px", fontSize: 14, fontWeight: 600,
                    borderRadius: 16, border: "2px solid #f1f5f9", background: "#f8fafc",
                    color: "#0f172a", outline: "none", transition: "all 0.2s",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#818cf8"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(129,140,248,0.1)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="t-submit" type="submit" disabled={loading}
            style={{
              marginTop: 28, width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, padding: "16px 24px", fontSize: 15, fontWeight: 700, color: "#fff",
              borderRadius: 16, border: "none", cursor: loading ? "wait" : "pointer",
              background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)",
              backgroundSize: "200% 200%",
              boxShadow: "0 4px 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
              transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              transform: "scale(1)", opacity: loading ? 0.8 : 1,
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.2)"; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.2)"; }}
          >
            {loading ? (
              <><span className="material-symbols-outlined" style={{ fontSize: 20, animation: "tracker-pulse-ring 1s infinite" }}>progress_activity</span> Đang tra cứu...</>
            ) : (
              <><span className="material-symbols-outlined" style={{ fontSize: 20 }}>search</span> Tra cứu đơn hàng</>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="tr-scale-in" style={{
              marginTop: 20, display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px", borderRadius: 16,
              background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
            }}>
              <span className="material-symbols-outlined" style={{ color: "#f87171", fontSize: 22 }}>error</span>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", margin: 0 }}>{error}</p>
            </div>
          )}
        </form>
      </div>

      {/* ═══════ RESULT SECTION ═══════ */}
      {order && si && showResult && (
        <div className="tr-fade-in" style={{ maxWidth: 1100, margin: "48px auto 0" }}>

          {/* ── STATUS HEADER ── */}
          <div className="tr-fade-in" style={{
            display: "flex", alignItems: "center", gap: 20, padding: "24px 28px",
            borderRadius: 24,
            background: isFailed
              ? "linear-gradient(135deg, rgba(248,113,113,0.06), rgba(248,113,113,0.02))"
              : "linear-gradient(135deg, rgba(129,140,248,0.06), rgba(167,139,250,0.02))",
            border: `1px solid ${isFailed ? "rgba(248,113,113,0.15)" : "rgba(129,140,248,0.15)"}`,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center",
              background: si.bg, flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: si.color }}>{si.icon}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94a3b8", margin: 0 }}>
                Trạng thái hiện tại
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, color: si.color, margin: "4px 0 0", letterSpacing: "-0.02em" }}>{si.label}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", margin: 0 }}>Mã vận đơn</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#334155", margin: "2px 0 0", fontFamily: "monospace", letterSpacing: "0.05em" }}>{order.mvd}</p>
            </div>
          </div>

          {/* ── HORIZONTAL STEPPER (desktop) ── */}
          {!isFailed && (
            <div className="tr-fade-in tr-d1" style={{ marginTop: 32, padding: "32px 20px", borderRadius: 24, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 4px 24px rgba(0,0,0,0.03)" }}>
              {/* Desktop Stepper */}
              <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }} className="tracker-stepper-desktop">
                {STEPS.map((step, i) => {
                  const done = i <= progress;
                  const active = i === progress;
                  const isLast = i === STEPS.length - 1;
                  return (
                    <div key={step.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                      {/* Connector line */}
                      {!isLast && (
                        <div style={{
                          position: "absolute", top: 20, left: "50%", right: "-50%", height: 3,
                          background: "#f1f5f9", borderRadius: 2, zIndex: 0,
                        }}>
                          {i < progress && (
                            <div style={{
                              height: "100%", width: "100%", borderRadius: 2,
                              background: "linear-gradient(90deg,#818cf8,#a78bfa)",
                              animation: "tracker-slide-right 0.8s ease-out both",
                              animationDelay: `${i * 0.15}s`,
                            }} />
                          )}
                        </div>
                      )}

                      {/* Circle */}
                      <div style={{
                        position: "relative", zIndex: 1, width: 40, height: 40, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: done
                          ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                          : "#f1f5f9",
                        boxShadow: active
                          ? "0 0 0 6px rgba(99,102,241,0.15), 0 4px 12px rgba(99,102,241,0.25)"
                          : done ? "0 2px 8px rgba(99,102,241,0.2)" : "none",
                        transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                      }}>
                        {done ? (
                          <span className="material-symbols-outlined" style={{
                            fontSize: 18, color: "#fff",
                            animation: `tracker-check-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both`,
                            animationDelay: `${i * 0.15}s`,
                          }}>
                            {active ? step.icon : "check"}
                          </span>
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#cbd5e1" }}>
                            {step.icon}
                          </span>
                        )}
                        {/* Pulse ring for active */}
                        {active && (
                          <div style={{
                            position: "absolute", inset: -4, borderRadius: "50%",
                            border: "2px solid #818cf8", opacity: 0,
                            animation: "tracker-pulse-ring 2s infinite",
                          }} />
                        )}
                      </div>

                      {/* Label */}
                      <p style={{
                        marginTop: 12, fontSize: 13, fontWeight: active ? 800 : 600,
                        color: done ? (active ? "#6366f1" : "#334155") : "#cbd5e1",
                        textAlign: "center", transition: "all 0.3s",
                      }}>
                        {step.label}
                      </p>
                      <p style={{
                        marginTop: 2, fontSize: 11, fontWeight: 500,
                        color: done ? "#94a3b8" : "#e2e8f0",
                        textAlign: "center", maxWidth: 120, lineHeight: 1.4,
                      }}>
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── FAILED/CANCELLED BANNER ── */}
          {isFailed && (
            <div className="tr-scale-in tr-d1" style={{
              marginTop: 32, display: "flex", alignItems: "center", gap: 16,
              padding: "20px 24px", borderRadius: 20,
              background: "linear-gradient(135deg, rgba(248,113,113,0.08), rgba(251,146,60,0.04))",
              border: "1px solid rgba(248,113,113,0.2)",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(248,113,113,0.12)", flexShrink: 0,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 26, color: "#f87171" }}>warning</span>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#dc2626", margin: 0 }}>{si.label}</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#ef4444", margin: "4px 0 0", opacity: 0.8 }}>
                  {(order.status ?? "").toUpperCase() === "CANCELLED"
                    ? "Đơn hàng đã được hủy bỏ."
                    : "Đơn hàng gặp sự cố trong quá trình giao hàng."}
                </p>
              </div>
            </div>
          )}

          {/* ── GRID: Order Info + Products ── */}
          <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="tracker-detail-grid">

            {/* ORDER INFO CARD */}
            <div className="tr-fade-in tr-d2" style={{
              borderRadius: 24, padding: "28px",
              background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "linear-gradient(135deg,#ede9fe,#e0e7ff)",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#6366f1" }}>receipt_long</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>Thông tin đơn hàng</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { label: "Mã vận đơn", value: order.mvd, mono: true },
                  { label: "Ngày đặt hàng", value: fmtDate(order.orderedDate) },
                  { label: "Tổng tiền", value: fmtVnd(order.total), highlight: true },
                  { label: "Thanh toán", value: order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : order.paymentMethod },
                  ...(order.estimatedDeliveryDate ? [{ label: "Dự kiến giao", value: fmtDate(order.estimatedDeliveryDate) }] : []),
                ].map((row, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 0",
                    borderBottom: i < 4 ? "1px solid #f1f5f9" : "none",
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>{row.label}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: row.highlight ? "#6366f1" : "#0f172a",
                      fontFamily: row.mono ? "monospace" : "inherit",
                      letterSpacing: row.mono ? "0.04em" : "normal",
                    }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {order.shippingAddress && (
                <div style={{
                  marginTop: 20, padding: "16px 18px", borderRadius: 16,
                  background: "linear-gradient(135deg,#f8fafc,#f1f5f9)",
                  border: "1px solid #e2e8f0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#6366f1" }}>location_on</span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748b" }}>Địa chỉ giao hàng</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#334155", margin: 0, lineHeight: 1.6 }}>
                    {order.shippingAddress}
                  </p>
                </div>
              )}
            </div>

            {/* PRODUCTS CARD */}
            <div className="tr-fade-in tr-d3" style={{
              borderRadius: 24, padding: "28px",
              background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "linear-gradient(135deg,#fce7f3,#ede9fe)",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#a855f7" }}>shopping_bag</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Sản phẩm
                  {order.items?.length > 0 && (
                    <span style={{
                      marginLeft: 8, display: "inline-flex", alignItems: "center", justifyContent: "center",
                      minWidth: 22, height: 22, borderRadius: 7, fontSize: 11, fontWeight: 800,
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
                      padding: "0 6px",
                    }}>{order.items.length}</span>
                  )}
                </h3>
              </div>

              {order.items?.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {order.items.map((it, i) => {
                    const img = imgUrl(it.product?.primaryImageUrl);
                    const name = it.productNameSnapshot || it.product?.productName || `Sản phẩm #${it.productId}`;
                    return (
                      <div key={it.id ?? i} style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 16px", borderRadius: 16,
                        background: "#f8fafc", border: "1px solid #f1f5f9",
                        transition: "all 0.2s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.transform = "translateX(4px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.transform = "translateX(0)"; }}
                      >
                        {img ? (
                          <img src={img} alt={name} style={{
                            width: 56, height: 56, borderRadius: 14, objectFit: "cover",
                            border: "1px solid #e2e8f0", flexShrink: 0,
                          }} />
                        ) : (
                          <div style={{
                            width: 56, height: 56, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                            background: "#e2e8f0", flexShrink: 0,
                          }}>
                            <span className="material-symbols-outlined" style={{ color: "#94a3b8", fontSize: 24 }}>image</span>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                          {it.variantLabel && <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontWeight: 500 }}>{it.variantLabel}</p>}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: "#6366f1" }}>{fmtVnd(it.subTotal)}</span>
                            <span style={{
                              fontSize: 11, fontWeight: 700, color: "#94a3b8",
                              background: "#f1f5f9", padding: "2px 10px", borderRadius: 8,
                            }}>×{it.quantity}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── SEARCH AGAIN BUTTON ── */}
          <div className="tr-fade-in tr-d4" style={{ textAlign: "center", marginTop: 40 }}>
            <button
              type="button"
              onClick={() => { setOrder(null); setShowResult(false); setMvd(""); setPhone(""); setError(null); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 14,
                background: "transparent", border: "2px solid #e2e8f0",
                fontSize: 14, fontWeight: 700, color: "#64748b",
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#818cf8"; e.currentTarget.style.color = "#6366f1"; e.currentTarget.style.background = "rgba(129,140,248,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "transparent"; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
              Tra cứu đơn khác
            </button>
          </div>
        </div>
      )}

      {/* ── RESPONSIVE CSS ── */}
      <style>{`
        @media (max-width: 768px) {
          .tracker-detail-grid {
            grid-template-columns: 1fr !important;
          }
          .tracker-stepper-desktop {
            flex-direction: column !important;
            gap: 0 !important;
          }
          .tracker-stepper-desktop > div {
            flex-direction: row !important;
            align-items: center !important;
            gap: 16px !important;
          }
          .tracker-stepper-desktop > div > p {
            text-align: left !important;
            margin-top: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
