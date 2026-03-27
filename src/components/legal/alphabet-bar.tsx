"use client"

import { cn } from "@/lib/utils"

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

interface AlphabetBarProps {
  activeLetter: string | null
  letterCounts: Record<string, number>
  onLetterClick: (letter: string | null) => void
}

export function AlphabetBar({
  activeLetter,
  letterCounts,
  onLetterClick,
}: AlphabetBarProps) {
  return (
    <div className="rounded-lg border border-border overflow-x-auto">
      <div className="flex items-center gap-1 p-2 min-w-max">
        <button
          onClick={() => onLetterClick(null)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeLetter === null
              ? "bg-brand-600 text-white dark:bg-brand-500"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          All
        </button>
        {LETTERS.map((letter) => {
          const count = letterCounts[letter] ?? 0
          const isActive = activeLetter === letter
          const isDisabled = count === 0

          return (
            <button
              key={letter}
              onClick={() => onLetterClick(letter)}
              disabled={isDisabled}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-600 text-white dark:bg-brand-500"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
              )}
            >
              {letter}
            </button>
          )
        })}
      </div>
    </div>
  )
}
