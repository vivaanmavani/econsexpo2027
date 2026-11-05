// Several things can put dark material under the header at once: section observers, the opening
// and the photo story's colour handoff. The header is dark while any of them says so.
const dark = new Set<string>();

export function navTone(source: string, isDark: boolean) {
  if (isDark) dark.add(source);
  else dark.delete(source);
  document.querySelector(".nav")?.toggleAttribute("data-dark", dark.size > 0);
}
