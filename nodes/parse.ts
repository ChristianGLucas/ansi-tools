import Anser from 'anser';
import { AnsiText, ParseResult, Span } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';

/**
 * Decomposes ANSI-colored text into an ordered list of styled spans, each
 * carrying its literal text plus resolved foreground/background color as a
 * comma-separated "r, g, b" string (already resolved from whichever color
 * model set it — basic-16, 256-palette, or 24-bit truecolor) and decorations
 * (bold, italic, underline, dim, blink, reverse, hidden, strikethrough).
 * Concatenating every span's text reconstructs the plain text. Empty spans
 * are omitted.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function parse(ax: AxiomContext, input: AnsiText): ParseResult {
  const result = new ParseResult();
  const text = input.getText() ?? '';

  const entries = Anser.ansiToJson(text, { json: true, remove_empty: true });
  const spans: Span[] = entries.map((entry) => {
    const span = new Span();
    span.setText(entry.content);
    if (entry.fg) span.setFg(entry.fg);
    if (entry.bg) span.setBg(entry.bg);
    if (entry.decorations && entry.decorations.length) {
      span.setDecorationsList(entry.decorations);
    }
    return span;
  });
  result.setSpansList(spans);
  return result;
}
