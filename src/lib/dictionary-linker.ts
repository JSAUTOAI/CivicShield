/**
 * Dictionary Linker — Progressive enhancement for AI analysis output
 *
 * Scans text for known legal dictionary terms and provides data
 * for rendering them as clickable links to dictionary entries.
 */

export interface TermMatch {
  term: string
  slug: string
  startIndex: number
  endIndex: number
}

/**
 * Find dictionary term matches within a text string.
 * Uses word-boundary matching to avoid false positives.
 * Returns matches sorted by position (longest match first to handle overlapping terms).
 */
export function findTermMatches(
  text: string,
  knownTerms: Array<{ term: string; slug: string }>
): TermMatch[] {
  if (!text || knownTerms.length === 0) return []

  const matches: TermMatch[] = []
  const lowerText = text.toLowerCase()

  // Sort by term length descending to prioritize longer matches
  const sorted = [...knownTerms].sort((a, b) => b.term.length - a.term.length)

  const usedRanges: Array<[number, number]> = []

  for (const { term, slug } of sorted) {
    const lowerTerm = term.toLowerCase()
    let searchFrom = 0

    while (searchFrom < lowerText.length) {
      const idx = lowerText.indexOf(lowerTerm, searchFrom)
      if (idx === -1) break

      const endIdx = idx + lowerTerm.length

      // Check word boundaries
      const charBefore = idx > 0 ? lowerText[idx - 1] : " "
      const charAfter = endIdx < lowerText.length ? lowerText[endIdx] : " "
      const isWordBoundary =
        /[\s,.:;!?()\-"']/.test(charBefore) && /[\s,.:;!?()\-"']/.test(charAfter)

      // Check overlap with existing matches
      const overlaps = usedRanges.some(
        ([start, end]) => idx < end && endIdx > start
      )

      if (isWordBoundary && !overlaps) {
        matches.push({ term, slug, startIndex: idx, endIndex: endIdx })
        usedRanges.push([idx, endIdx])
      }

      searchFrom = idx + 1
    }
  }

  // Sort by position for sequential rendering
  return matches.sort((a, b) => a.startIndex - b.startIndex)
}

/**
 * Split text into segments: plain text and term matches.
 * Useful for rendering text with embedded dictionary links.
 */
export function segmentText(
  text: string,
  knownTerms: Array<{ term: string; slug: string }>
): Array<{ type: "text"; content: string } | { type: "term"; term: string; slug: string }> {
  const matches = findTermMatches(text, knownTerms)
  if (matches.length === 0) return [{ type: "text", content: text }]

  const segments: Array<
    { type: "text"; content: string } | { type: "term"; term: string; slug: string }
  > = []
  let lastEnd = 0

  for (const match of matches) {
    if (match.startIndex > lastEnd) {
      segments.push({ type: "text", content: text.slice(lastEnd, match.startIndex) })
    }
    segments.push({
      type: "term",
      term: text.slice(match.startIndex, match.endIndex),
      slug: match.slug,
    })
    lastEnd = match.endIndex
  }

  if (lastEnd < text.length) {
    segments.push({ type: "text", content: text.slice(lastEnd) })
  }

  return segments
}
