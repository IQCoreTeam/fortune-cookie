"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShareNetwork, Copy, Check } from "@phosphor-icons/react"
import { type Fortune } from "@/data/fortunes"

interface Props {
  fortune: Fortune
}

export default function ShareButton({ fortune }: Props) {
  const [copied, setCopied] = useState(false)
  const [toastMsg, setToastMsg] = useState("")

  const shareText = `"${fortune.text}" — Lucky numbers: ${fortune.luckyNumbers.join(", ")} ${fortune.luckyEmoji}`

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Fortune Cookie",
          text: shareText,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setToastMsg("Fortune copied to clipboard!")
        setTimeout(() => {
          setCopied(false)
          setToastMsg("")
        }, 2500)
      }
    } catch {
      // user cancelled share or clipboard failed
    }
  }, [shareText])

  return (
    <div className="relative">
      <motion.button
        onClick={handleShare}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96, y: 1 }}
        className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A78BFA]/60"
        style={{
          fontFamily: "var(--font-nunito)",
          background: "rgba(167,139,250,0.15)",
          border: "1px solid rgba(167,139,250,0.4)",
          color: "#C4B5FD",
          backdropFilter: "blur(8px)",
          minHeight: 44,
          minWidth: 44,
        }}
        aria-label="Share your fortune"
      >
        {copied ? (
          <Check weight="bold" size={16} />
        ) : (
          <ShareNetwork weight="bold" size={16} />
        )}
        {copied ? "Copied!" : "Share"}
      </motion.button>

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-full left-1/2 mb-2 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs"
            style={{
              transform: "translateX(-50%)",
              background: "rgba(45, 27, 94, 0.95)",
              border: "1px solid rgba(167,139,250,0.3)",
              color: "#C4B5FD",
              fontFamily: "var(--font-nunito)",
            }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
