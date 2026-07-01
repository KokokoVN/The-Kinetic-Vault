"use client";

import { shouldShowStorefrontChat } from "@/lib/storefront-path";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type ChatTurn = { role: "user" | "assistant"; content: string; time: string };

/* ── Suggestion chips ── */
const QUICK_CHIPS = [
  { icon: "local_fire_department", label: "Sản phẩm nổi bật" },
  { icon: "sell", label: "Đang có khuyến mãi gì?" },
  { icon: "account_balance_wallet", label: "Tư vấn theo ngân sách" },
  { icon: "help", label: "Hướng dẫn đặt hàng" },
];

/* ── Simple markdown: **bold**, bullet points ── */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.trim() === "") {
      elements.push(<br key={key++} />);
      continue;
    }
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    // Bullet point
    const trimmed = line.trimStart();
    if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <div key={key++} style={{ display: "flex", gap: 6, marginTop: 2, paddingLeft: 2 }}>
          <span style={{ color: "#818cf8", flexShrink: 0, fontWeight: 700 }}>•</span>
          <span>{rendered.map((r, i) => typeof r === "string" ? r.replace(/^[•\-*]\s/, "") : r)}</span>
        </div>
      );
    } else {
      elements.push(<span key={key++}>{rendered}</span>);
    }
  }
  return elements;
}

function getNow(): string {
  return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

/* ── CSS Animations ── */
const CHAT_STYLES = `
@keyframes chat-slide-up {
  from { opacity: 0; transform: translateY(16px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes chat-msg-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes chat-fab-pulse {
  0%   { box-shadow: 0 4px 20px rgba(99,102,241,0.35); }
  50%  { box-shadow: 0 4px 30px rgba(99,102,241,0.55), 0 0 0 8px rgba(99,102,241,0.08); }
  100% { box-shadow: 0 4px 20px rgba(99,102,241,0.35); }
}
@keyframes chat-dot-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
@keyframes chat-fab-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(180deg); }
}
`;

export function ProductConsultantChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      role: "assistant",
      content: "Xin chào! 👋 Mình là trợ lý AI của cửa hàng. Mình có thể giúp bạn:\n\n• Tư vấn sản phẩm phù hợp\n• Thông tin khuyến mãi đang có\n• Hướng dẫn đặt hàng & thanh toán\n\nBạn cần hỗ trợ gì nào?",
      time: getNow(),
    },
  ]);
  const [showChips, setShowChips] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages, open]);

  const send = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text || busy) return;
      setInput("");
      setShowChips(false);
      const nextUser: ChatTurn = { role: "user", content: text, time: getNow() };
      setMessages((m) => [...m, nextUser]);
      setBusy(true);
      try {
        const prior = messages.slice(-12).map((t) => ({ role: t.role, content: t.content }));
        const res = await fetch("/api/chatbot/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ message: text, history: prior }),
          cache: "no-store",
        });
        let data: { reply?: string; demoMode?: boolean; error?: string; detail?: string; upstream?: string; hint?: string };
        try {
          data = (await res.json()) as typeof data;
        } catch {
          setMessages((m) => [...m, { role: "assistant", content: `Lỗi: Phản hồi không phải JSON (${res.status})`, time: getNow() }]);
          return;
        }
        if (!res.ok) {
          const bits = [data.error, data.detail, data.hint].filter((x) => x && String(x).trim());
          const err = bits.length > 0 ? bits.join("\n\n") : res.statusText;
          const where = data.upstream ? `\n\n(Đang gọi: ${data.upstream})` : "";
          setMessages((m) => [...m, { role: "assistant", content: `Lỗi: ${err}${where}`, time: getNow() }]);
          return;
        }
        const reply = data.reply?.trim() || "(Không có phản hồi)";
        const tag = data.demoMode ? "\n\n— Đang chế độ demo hoặc catalog/AI chưa sẵn sàng." : "";
        setMessages((m) => [...m, { role: "assistant", content: reply + tag, time: getNow() }]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Lỗi mạng";
        setMessages((m) => [...m, { role: "assistant", content: `Không gửi được tin: ${msg}`, time: getNow() }]);
      } finally {
        setBusy(false);
      }
    },
    [busy, input, messages],
  );

  if (!shouldShowStorefrontChat(pathname)) {
    return null;
  }

  return (
    <>
      <style>{CHAT_STYLES}</style>
      <div style={{
        position: "fixed", bottom: 0, right: 0, zIndex: 100,
        display: "flex", flexDirection: "column", alignItems: "flex-end",
        gap: 12, padding: "16px 20px",
        pointerEvents: "none",
      }}>

        {/* ═══ CHAT WINDOW ═══ */}
        {open && (
          <div
            role="dialog"
            aria-label="Tư vấn AI"
            style={{
              pointerEvents: "auto",
              display: "flex",
              flexDirection: "column",
              width: "min(100vw - 2rem, 400px)",
              maxHeight: "min(520px, 75vh)",
              borderRadius: 24,
              overflow: "hidden",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(24px) saturate(1.8)",
              WebkitBackdropFilter: "blur(24px) saturate(1.8)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)",
              animation: "chat-slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            {/* ── Header ── */}
            <div style={{
              flexShrink: 0, padding: "16px 20px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#fff" }}>smart_toy</span>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>Trợ lý AI</p>
                  <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.7)", margin: "1px 0 0" }}>
                    {busy ? "Đang trả lời..." : "Trực tuyến"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng chat"
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  border: "none", background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "background 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#fff" }}>close</span>
              </button>
            </div>

            {/* ── Messages ── */}
            <div
              ref={listRef}
              style={{
                flex: 1, minHeight: 0, overflowY: "auto",
                padding: "16px 16px 8px",
                display: "flex", flexDirection: "column", gap: 10,
              }}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: m.role === "user" ? "flex-end" : "flex-start",
                    animation: "chat-msg-in 0.3s ease-out both",
                    animationDelay: `${Math.min(i * 0.05, 0.3)}s`,
                  }}
                >
                  <div style={{
                    maxWidth: "85%",
                    padding: "12px 16px",
                    borderRadius: m.role === "user" ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                    background: m.role === "user"
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "#f1f5f9",
                    color: m.role === "user" ? "#fff" : "#1e293b",
                    fontSize: 13,
                    fontWeight: 500,
                    lineHeight: 1.6,
                    wordBreak: "break-word" as const,
                    boxShadow: m.role === "user"
                      ? "0 2px 8px rgba(99,102,241,0.2)"
                      : "0 1px 3px rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ whiteSpace: "pre-wrap" }}>{renderMarkdown(m.content)}</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 500, color: "#94a3b8",
                    marginTop: 4, padding: "0 4px",
                  }}>{m.time}</span>
                </div>
              ))}

              {/* Typing indicator */}
              {busy && (
                <div style={{
                  display: "flex", alignItems: "flex-start",
                  animation: "chat-msg-in 0.3s ease-out both",
                }}>
                  <div style={{
                    padding: "12px 20px", borderRadius: "18px 18px 18px 6px",
                    background: "#f1f5f9", display: "flex", gap: 5, alignItems: "center",
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "#818cf8",
                        animation: "chat-dot-bounce 1.4s infinite",
                        animationDelay: `${i * 0.2}s`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Quick suggestion chips ── */}
            {showChips && messages.length <= 1 && (
              <div style={{
                flexShrink: 0, padding: "0 16px 12px",
                display: "flex", flexWrap: "wrap", gap: 6,
              }}>
                {QUICK_CHIPS.map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => send(chip.label)}
                    disabled={busy}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "8px 14px", borderRadius: 20,
                      border: "1.5px solid #e2e8f0", background: "#fff",
                      fontSize: 12, fontWeight: 600, color: "#475569",
                      cursor: "pointer", transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "#818cf8";
                      e.currentTarget.style.color = "#6366f1";
                      e.currentTarget.style.background = "rgba(99,102,241,0.04)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.color = "#475569";
                      e.currentTarget.style.background = "#fff";
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{chip.icon}</span>
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Input bar ── */}
            <div style={{
              flexShrink: 0,
              padding: "12px 16px 16px",
              borderTop: "1px solid #f1f5f9",
              background: "#fafbfc",
            }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), void send())}
                    placeholder="Nhập tin nhắn..."
                    disabled={busy}
                    autoComplete="off"
                    style={{
                      width: "100%", padding: "12px 16px",
                      borderRadius: 16, border: "2px solid #f1f5f9",
                      background: "#fff", fontSize: 13, fontWeight: 500,
                      color: "#0f172a", outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = "#818cf8";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(129,140,248,0.1)";
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = "#f1f5f9";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={busy || !input.trim()}
                  aria-label="Gửi"
                  style={{
                    width: 44, height: 44, borderRadius: 14, border: "none",
                    background: (!busy && input.trim())
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "#e2e8f0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: (!busy && input.trim()) ? "pointer" : "default",
                    transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                    transform: "scale(1)",
                    boxShadow: (!busy && input.trim()) ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    if (!busy && input.trim()) e.currentTarget.style.transform = "scale(1.08)";
                  }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <span className="material-symbols-outlined" style={{
                    fontSize: 20,
                    color: (!busy && input.trim()) ? "#fff" : "#94a3b8",
                  }}>send</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ FAB BUTTON ═══ */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Thu gọn tư vấn" : "Mở tư vấn AI"}
          style={{
            pointerEvents: "auto",
            width: 60, height: 60, borderRadius: 20,
            border: "none",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
            animation: open ? "none" : "chat-fab-pulse 3s infinite",
            transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), border-radius 0.3s",
            transform: "scale(1)",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <span className="material-symbols-outlined" style={{
            fontSize: 28, color: "#fff",
            transition: "transform 0.3s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}>
            {open ? "expand_more" : "support_agent"}
          </span>
        </button>
      </div>
    </>
  );
}
