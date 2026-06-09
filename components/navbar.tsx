"use client"

import Link from "next/link"
import { ArrowDownToLine } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-border/50" />
      <div className="container relative flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center shadow-md shadow-violet-500/20 transition-shadow group-hover:shadow-lg group-hover:shadow-violet-500/30">
            <ArrowDownToLine className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Save<span className="gradient-accent-text">ik</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
