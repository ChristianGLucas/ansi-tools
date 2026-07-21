import ansiRegexFactory from 'ansi-regex';

// Shared helpers for ansi-tools nodes: input-size bounding, the shared
// escape-sequence regex (via ansi-regex — the same ReDoS-patched, actively
// maintained pattern chalk/strip-ansi itself wraps), category classifiers
// (SGR / other-CSI / OSC), and small formatting utilities reused across
// nodes.
//
// NOTE: every escape byte in this file is written as the \x1b hex escape,
// never as a literal control character in source — a literal ESC byte is
// invisible in a diff/editor and easy to corrupt silently.

// Hard cap on any `text` field this package accepts. Bounds cost (regex scan,
// allocation, span construction) up front, on the raw input, before any
// parsing happens.
export const MAX_TEXT_LENGTH = 2 * 1024 * 1024; // 2 MiB, measured in UTF-16 code units

// Sanity cap on width/start/end parameters. Not required for safety (the
// wrapped libraries are linear in input length, not in the requested width),
// but rejects nonsensical requests deterministically instead of silently
// clamping them.
export const MAX_COLUMN = 100_000_000;

/** Validates `text` against MAX_TEXT_LENGTH. Returns the structured error
 * code "INPUT_TOO_LARGE", or '' if valid — never throws. Every node checks
 * this first and returns early with `error` set rather than proceeding to
 * allocate/parse/regex-scan an oversized input. */
export function checkTextSize(text: string): string {
  return text.length > MAX_TEXT_LENGTH ? 'INPUT_TOO_LARGE' : '';
}

// Any recognized escape sequence (OSC hyperlink/title-setting, or CSI —
// which covers both SGR color/style and cursor movement/erase/scroll).
// ansi-regex() returns a fresh RegExp with the global flag, matching its
// own combined (osc|csi) pattern — the exact same regex strip-ansi wraps,
// confirmed patched against the historical ReDoS CVE (fixed in 5.0.1+;
// this package pins 6.2.2). A fresh instance per call to sidestep any
// shared-lastIndex footgun, even though every use site here is a
// self-contained .match()/.replace() pass that Jest/V8 already reset.
export function newEscapeRegex(): RegExp {
  return ansiRegexFactory();
}

// A module-level instance for call sites that just need to pass a RegExp to
// .match()/.replace() — both APIs run their own complete pass and leave no
// residual lastIndex state behind, so reuse here is safe.
export const ANY_ESCAPE_RE = newEscapeRegex();

// KNOWN, VERIFIED, INHERITED BEHAVIOR (found by adversarial review; do not
// "fix" this by hand-rolling a stricter pattern — that would be
// reimplementing what a battle-tested, actively maintained library already
// owns, and is far more likely to introduce a new bug than to remove one.
// The correct response was to document it precisely, which strip.ts's
// JSDoc + this package's axiom.yaml Strip description now do):
// ansi-regex's CSI final-byte character class ([\dA-PR-TZcf-nq-uy=><~])
// also accepts a DIGIT as a valid final byte. Two consequences on
// malformed/truncated input:
//   1. A CSI sequence truncated right after its numeric parameters (no true
//      final letter, e.g. "\x1b[38;5" with no trailing "m") still matches
//      as if complete -- its last digit(s) are consumed as the "final
//      byte", so Strip/ExtractCodes/ClassifyEscapes silently drop them
//      rather than preserving them as literal text. A bare, digit-free
//      introducer ("\x1b[" with nothing after it) is NOT affected -- it is
//      correctly left as literal text, since there is no digit for the
//      final-byte class to latch onto.
//   2. An OSC sequence (e.g. a hyperlink) missing its BEL/ST terminator
//      does not match the OSC alternative at all, but ']' is also a valid
//      CSI intermediate byte -- so the CSI alternative can match starting
//      from the same "\x1b]", consume a few digits/semicolons as bogus
//      params, and land on an ordinary letter in the following real text as
//      its "final byte", eating that one character.
// Both are deterministic and non-crashing; see strip_test.ts for locked-in
// regression cases.

/** True when a CSI match's final byte is 'm' (dec 109) — i.e. it's SGR. */
export function isSgr(match: string): boolean {
  return match.length > 0 && match[match.length - 1] === 'm';
}

/** True when a match came from the OSC alternative (starts with ESC ]). */
export function isOsc(match: string): boolean {
  return match.length >= 2 && match.charCodeAt(0) === 0x1b && match[1] === ']';
}

/** Parses the semicolon/colon-separated numeric parameters out of an SGR
 * sequence like "\x1b[1;31m" -> [1, 31]. Returns [] for a bare reset
 * "\x1b[m" or a malformed body. */
export function parseSgrParams(raw: string): number[] {
  // Strip the ESC/C1 introducer, any intermediates, and the trailing final
  // byte, leaving just the numeric parameter block.
  const body = raw
    .replace(/^[\x1b\x9b]/, '')
    .replace(/^[[\]()#;?]*/, '')
    .replace(/[\dA-PR-TZcf-nq-uy=><~]$/, '');
  if (body === '') return [];
  return body
    .split(/[;:]/)
    .filter((p) => p !== '')
    .map((p) => parseInt(p, 10))
    .filter((n) => Number.isFinite(n));
}

export function toHex(r: number, g: number, b: number): string {
  const c = (n: number) => n.toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

// The standard xterm 16-color palette (system colors 0-7, bright variants
// 8-15). Matches ECMA-48/ANSI.SYS convention and IonicaBizau/anser's own
// ANSI_COLORS table (cross-checked in tests as an independent oracle).
export const BASIC16_PALETTE: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0, 0],
  [187, 0, 0],
  [0, 187, 0],
  [187, 187, 0],
  [0, 0, 187],
  [187, 0, 187],
  [0, 187, 187],
  [255, 255, 255],
  [85, 85, 85],
  [255, 85, 85],
  [0, 255, 0],
  [255, 255, 85],
  [85, 85, 255],
  [255, 85, 255],
  [85, 255, 255],
  [255, 255, 255],
];

/** Resolves a standard xterm 256-color palette index (0-255) to RGB.
 * 0-15: the basic16 system colors. 16-231: a 6x6x6 RGB cube. 232-255: a
 * 24-step grayscale ramp. Returns null for an out-of-range index. */
export function palette256ToRgb(index: number): [number, number, number] | null {
  if (!Number.isInteger(index) || index < 0 || index > 255) return null;
  if (index < 16) return [...BASIC16_PALETTE[index]];
  if (index < 232) {
    const levels = [0, 95, 135, 175, 215, 255];
    const i = index - 16;
    const r = Math.floor(i / 36);
    const g = Math.floor((i % 36) / 6);
    const b = i % 6;
    return [levels[r], levels[g], levels[b]];
  }
  const level = 8 + (index - 232) * 10;
  return [level, level, level];
}
