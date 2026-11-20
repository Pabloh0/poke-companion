/**
 * Pokédex entries come with the line breaks of the game's text box:
 * "\n", form feeds and soft hyphens that split words across lines.
 */
export function cleanFlavorText(raw: string): string {
  return raw
    .replace(/­\s*/g, "") // soft hyphen + line break: rejoin the word
    .replace(/-\n/g, "-") // real hyphen at a line break: keep it, drop the break
    .replace(/\s+/g, " ") // newlines, form feeds, double spaces → one space
    .trim();
}
