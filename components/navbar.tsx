"use client"

import Link from "next/link"
import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-border/50" />
      <div className="container relative flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-violet-500/20 transition-shadow group-hover:shadow-lg group-hover:shadow-violet-500/30 overflow-hidden">
            <Image src="/logo.svg" alt="Saveik" width={36} height={36} className="w-full h-full" priority />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Save<span className="gradient-accent-text">ik</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
