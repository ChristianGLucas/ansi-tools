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

## Use it from your agent or app

Every node in this package is a **live, auto-scaling API endpoint** on the
[Axiom](https://axiomide.com) marketplace — call it from an AI agent or your own
code, with nothing to self-host.

**📦 See it on the marketplace:**
https://dev.axiomide.com/marketplace/christiangeorgelucas/ansi-tools@0.1.0

**Hook it up to an AI agent (MCP).** Add Axiom's hosted MCP server to any MCP
client and every node becomes a typed tool your agent can call — search the
catalog, inspect a schema, and invoke it directly.

```bash
# Claude Code
claude mcp add --transport http axiom https://api.axiomide.com/mcp \
  --header "Authorization: Bearer $AXIOM_API_KEY"
```

Claude Desktop, Cursor, or any config-based client:

```json
{
  "mcpServers": {
    "axiom": {
      "type": "http",
      "url": "https://api.axiomide.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_AXIOM_API_KEY" }
    }
  }
}
```

**Call it from the CLI.**

```bash
axiom invoke christiangeorgelucas/ansi-tools/Strip --input '{ ... }'
```

**Call it over HTTP.**

```bash
curl -X POST https://api.axiomide.com/invocations/v1/nodes/christiangeorgelucas/ansi-tools/0.1.0/Strip \
  -H "Authorization: Bearer $AXIOM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ ... }'
```

> Input/output schema for each node is on the marketplace page above, or via
> `axiom inspect node christiangeorgelucas/ansi-tools/Strip`.

### Get started free

Install the CLI:

```bash
# macOS / Linux — Homebrew
brew install axiomide/tap/axiom

# macOS / Linux — install script
curl -fsSL https://raw.githubusercontent.com/AxiomIDE/axiom-releases/main/install.sh | sh
```

**Windows:** download the `windows/amd64` `.zip` from the
[releases page](https://github.com/AxiomIDE/axiom-releases/releases), unzip it,
and put `axiom.exe` on your `PATH`.

Then `axiom version` to verify, `axiom login` (GitHub or Google) to authenticate,
and create an API key under **Console → API Keys**. Docs and sign-up at
**[axiomide.com](https://axiomide.com)**.

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
`CHANNEL_OUT_OF_RANGE` — and every other field is left at its zero value,
**except** `TruncateToWidth`'s `INVALID_WIDTH` case, which deliberately
echoes the original `text` back unchanged (documented on `TruncateResult` in
`messages/messages.proto`) so a caller can tell "rejected, here's what you
sent" from "rejected, nothing survived". No node throws or crashes on
malformed input.

**Malformed/truncated escape sequences are never a crash, but are not always
byte-perfect either.** `Strip`/`Detect`/`ExtractCodes`/`ClassifyEscapes` (the
`ansi-regex`-backed nodes) and `Parse`/`ToHtml`/`ToStyleMap` (the
`anser`-backed nodes) can disagree on a truncated sequence's trailing digits:
`anser` keeps them as visible plain text (`"Hello\x1b[38;5"` → `"Hello38;5"`),
while `ansi-regex`'s final-byte class also accepts a digit, so it instead
matches and removes the whole thing (`"Hello\x1b[38;5"` → `"Hello"`, that
"38;5" silently dropped). A bare, digit-free truncated introducer
(`"\x1b["` with nothing after it) is preserved as literal text by both. See
`nodes/strip.ts`'s doc comment and `nodes/_shared.ts` for the exact
mechanism; both behaviors are inherited from the wrapped libraries, verified
directly against them, and locked in by regression tests.

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

All direct dependencies are MIT. Transitively: `strip-ansi` depends on
`ansi-regex` (MIT); `string-width` depends on `strip-ansi` and
`get-east-asian-width` (MIT); `slice-ansi` depends on `ansi-styles` and
`is-fullwidth-code-point` (MIT), and `ansi-styles` itself depends on
`color-convert` (MIT), which depends on `color-name` (MIT). No copyleft
anywhere in the dependency tree — verified with `npm ls --all` against the
actual installed tree, not just each package's stated license field.

## Licence

MIT — see [LICENSE](LICENSE).
