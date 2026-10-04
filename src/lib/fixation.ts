/**
 * Saccade Fixation (Bionic Reading) engine.
 * Bolds the optimal fixation root of each word so the eye's saccadic
 * jumps land on high-information characters, reducing cognitive load.
 */

function getBoldLength(wordLength: number): number {
  if (wordLength <= 3) return 1;
  if (wordLength <= 6) return 2;
  return Math.ceil(wordLength * 0.42);
}

/**
 * Wraps the fixation root of a single word token in bold markup.
 * Punctuation attached to the word (e.g. trailing comma/period) is
 * passed through unchanged.
 */
function formatWord(token: string): string {
  // Separate leading and trailing non-alpha characters
  const leadingMatch = token.match(/^([^a-zA-Z0-9]*)(.*)/);
  if (!leadingMatch) return token;

  const leadingPunct = leadingMatch[1];
  const rest = leadingMatch[2];

  const trailingMatch = rest.match(/^(.*?)([^a-zA-Z0-9]*)$/);
  if (!trailingMatch) return token;

  const word = trailingMatch[1];
  const trailingPunct = trailingMatch[2];

  if (word.length === 0) return token;

  const boldLen = getBoldLength(word.length);
  const root = word.slice(0, boldLen);
  const tail = word.slice(boldLen);

  const rootHtml = `<strong class="bionic-strong">${root}</strong>`;
  const tailHtml =
    tail.length > 0 ? `<span class="bionic-tail">${tail}</span>` : "";

  return `${leadingPunct}${rootHtml}${tailHtml}${trailingPunct}`;
}

/**
 * Converts plain text into Saccade-Fixation HTML.
 * Preserves newlines and whitespace structure.
 */
export function formatBionicText(text: string): string {
  // Split into lines first to preserve paragraph structure
  const lines = text.split("\n");

  return lines
    .map((line) => {
      // Split each line into tokens (words + whitespace runs)
      const tokens = line.split(/(\s+)/);
      return tokens
        .map((token) => {
          // Pass whitespace tokens through unchanged
          if (/^\s+$/.test(token)) return token;
          return formatWord(token);
        })
        .join("");
    })
    .join("\n");
}
