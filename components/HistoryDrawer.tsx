"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ClockCounterClockwise, X, Trash } from "@phosphor-icons/react"
import { type HistoryEntry } from "@/hooks/useHistory"
import FortuneSlip from "./FortuneSlip"

interface Props {
  history: HistoryEntry[]
  onClear: () => void
}

export default function HistoryDrawer({ history, onClear }: Props) {
  const [open, setOpen] = useState(false)

  const fmt = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-6 right-6 z-30 flex items-center justify-center w-11 h-11 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF9F43]/60"
        style={{
          background: "rgba(255,159,67,0.15)",
          border: "1px solid rgba(255,159,67,0.35)",
          color: "#FF9F43",
          boxShadow: "0 0 18px rgba(255,159,67,0.2)",
        }}
        aria-label="View fortune history"
      >
        <ClockCounterClockwise weight="bold" size={18} />
        {history.length > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center"
            style={{ background: "#FF9F43", color: "#1A1033", fontFamily: "var(--font-vt323)" }}
          >
            {history.length}
          </span>
        )}
      </motion.button>

      {/* Drawer overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(13,8,33,0.7)", backdropFilter: "blur(4px)" }}
            />

            <motion.aside
              key="drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
              style={{
                background: "#2D1B5E",
                border: "1px solid rgba(167,139,250,0.2)",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
                maxHeight: "80dvh",
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: "rgba(167,139,250,0.35)" }} />
              </div>

              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-3"
                style={{ borderBottom: "1px solid rgba(167,139,250,0.15)" }}
              >
                <h2
                  className="text-base font-semibold"
                  style={{ fontFamily: "var(--font-fredoka)", color: "#FFF5E4" }}
                >
                  Fortune History
                </h2>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={onClear}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      style={{
                        color: "#FC8181",
                        background: "rgba(252,129,129,0.1)",
                        border: "1px solid rgba(252,129,129,0.25)",
                        fontFamily: "var(--font-nunito)",
                      }}
                    >
                      <Trash size={12} />
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]"
                    style={{ color: "#C4B5FD", background: "rgba(167,139,250,0.1)" }}
                    aria-label="Close history"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(80dvh - 100px)" }}>
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <p
                      className="text-4xl mb-3"
                      style={{ fontFamily: "var(--font-vt323)" }}
                    >
                      🍪
                    </p>
                    <p
                      className="text-sm"
                      style={{ fontFamily: "var(--font-nunito)", color: "#C4B5FD" }}
                    >
                      No fortunes yet. Crack your first cookie.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {history.map((entry, i) => (
                      <motion.div
                        key={`${entry.fortune.id}-${entry.timestamp}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
                      >
                        <div
                          className="mb-1.5 text-xs"
                          style={{ fontFamily: "var(--font-nunito)", color: "#C4B5FD" }}
                        >
                          {entry.fortune.luckyEmoji} {fmt(entry.timestamp)}
                        </div>
                        <FortuneSlip
                          fortune={entry.fortune}
                          active={false}
                          compact
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
