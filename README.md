# ansi-tools

Composable Axiom nodes for deterministic parsing, stripping, structural
analysis, and HTML/color conversion of ANSI/SGR terminal escape sequences —
published as `christiangeorgelucas/ansi-tools`. Built for the Axiom
marketplace.

The operation agents hit constantly: a shell command, a CI log line, or a
piped subprocess's stdout arrives full of `\x1b[...m` color codes, and the
agent needs the clean text, the styling, or both. This package covers that
surface liberally — eleven stateless nodes, all pure `text in -> text/struct
in-band data out`, no network, no wall-clock, no randomness.

## The nodes

| Node | Input → Output | What it does |
|---|---|---|
| `Strip` | `AnsiText` → `StripResult` | Removes every ANSI escape sequence, returns plain text + a removed-count. |
| `Detect` | `AnsiText` → `DetectResult` | Cheap yes/no + count check for whether text contains any ANSI escape. |
| `Parse` | `AnsiText` → `ParseResult` | Decomposes text into ordered styled `Span`s (text + resolved `"r, g, b"` color + decorations). |
| `ToHtml` | `ToHtmlRequest` → `HtmlResult` | Renders ANSI-colored text to HTML `<span>`s (inline styles or CSS classes). |
| `ToStyleMap` | `AnsiText` → `StyleMapResult` | Plain text plus styling as a separate offset-addressed overlay, instead of interleaved spans. |
| `VisibleWidth` | `AnsiText` → `WidthResult` | On-screen column width, ignoring escapes and correctly weighting wide CJK/emoji characters. |
| `TruncateToWidth` | `TruncateRequest` → `TruncateResult` | Truncates to N visible columns without splitting an escape sequence, closing any open style. |
| `SliceByColumn` | `SliceRequest` → `SliceResult` | Column-range slice (like `str[start:end]`, but visible-width-aware and styling-preserving). |
| `ExtractCodes` | `AnsiText` → `ExtractCodesResult` | Lists every distinct SGR/color code used, with parsed params and occurrence counts. |
| `ClassifyEscapes` | `ClassifyRequest` → `ClassifyResult` | Buckets escapes into SGR / cursor-CSI / OSC per ECMA-48, and optionally strips just one category. |
| `ColorCodeToRgb` | `ColorCodeRequest` → `ColorRgbResult` | Resolves a basic-16, 256-palette, or truecolor reference to concrete RGB/hex. |

## Error contract

Every result message carries a trailing `error` string field, empty on
success. On a rejected request (oversized input, an out-of-range parameter,
an unrecognized mode) it holds a short machine-stable code — `INPUT_TOO_LARGE`,
`INVALID_WIDTH`, `INVALID_RANGE`, `INVALID_MODE`, `INDEX_OUT_OF_RANGE`,
`CHANNEL_OUT_OF_RANGE` — and every other field is left at its zero value. No
node throws or crashes on malformed input; a malformed or incomplete escape
sequence in `text` is treated as literal text, never an error.

## Bounds

`text` fields are capped at 2 MiB; `width`/`start`/`end` column parameters are
capped at 100,000,000. Both bounds are checked against the raw input before
any parsing, allocation, or regex scan happens.

## The libraries

The hard parts are owned by mature, permissively-licensed, actively
maintained npm libraries — this package is a thin, typed wrapper plus the
glue to expose their surface as Axiom nodes:

- [`anser`](https://github.com/IonicaBizau/anser) (MIT, zero dependencies) —
  the core SGR parser: `Parse`, `ToStyleMap`, and `ToHtml`.
- [`ansi-regex`](https://github.com/chalk/ansi-regex) (MIT) — the
  ReDoS-patched (fixed since 5.0.1; this package pins 6.2.2) pattern that
  recognizes every ANSI escape sequence: `Strip`, `Detect`, `ExtractCodes`,
  `ClassifyEscapes`.
- [`strip-ansi`](https://github.com/chalk/strip-ansi) (MIT) — `Strip`.
- [`slice-ansi`](https://github.com/chalk/slice-ansi) (MIT) — visible-column
  slicing that preserves and closes styling: `TruncateToWidth`,
  `SliceByColumn`.
- [`string-width`](https://github.com/sindresorhus/string-width) (MIT) —
  East-Asian-Width-aware visible column counting: `VisibleWidth`, and
  internally by `TruncateToWidth`.

`ColorCodeToRgb`'s 256-color palette math (the 6x6x6 RGB cube and 24-step
grayscale ramp) implements the published, independently-documented xterm-256
standard directly; its test suite cross-checks the result against `anser`'s
own independent implementation of the same standard.

All direct dependencies are MIT, with one transitive `strip-ansi`
dependency (`ansi-regex`, MIT) and `string-width`/`slice-ansi`'s transitive
`get-east-asian-width` / `ansi-styles` / `is-fullwidth-code-point` (all MIT).
No copyleft anywhere in the dependency tree.

## Licence

MIT — see [LICENSE](LICENSE).
