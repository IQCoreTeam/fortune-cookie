"use client"

import { useCallback } from "react"
import { motion } from "framer-motion"
import { XLogo } from "@phosphor-icons/react"
import { type Fortune } from "@/data/fortunes"

interface Props {
  fortune: Fortune
}

export default function ShareButton({ fortune }: Props) {
  const handleShare = useCallback(() => {
    const shareUrl = new URL(window.location.href)
    shareUrl.searchParams.set("id", String(fortune.id))

    const tweet = `🥠 The IQ Fortune Cookie has spoken:

"${fortune.text}"

Crack yours open → ${shareUrl.toString()}`

    const intent = new URL("https://twitter.com/intent/tweet")
    intent.searchParams.set("text", tweet)

    window.open(intent.toString(), "_blank", "noopener,noreferrer")
  }, [fortune])

  return (
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
      aria-label="Share your fortune on X"
    >
      <XLogo weight="bold" size={16} />
      Share on X
    </motion.button>
  )
}
