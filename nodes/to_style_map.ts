import Anser from 'anser';
import { AnsiText, StyleMapResult, StyleRange } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { checkTextSize } from './_shared';

/**
 * Produces plain text and its styling as a separate offset-addressed overlay
 * — non-overlapping StyleRange entries (UTF-16 code-unit start/end offset
 * into plain_text, plus resolved "r, g, b" color and decorations) — instead
 * of interleaved spans. Useful when a caller already has the plain text
 * (e.g. from a search index) and needs to re-attach styling by position, or
 * wants to diff styling independent of text content. A stretch of plain_text
 * not covered by any range has no active styling. `text` over the 2 MiB cap
 * yields `error` = "INPUT_TOO_LARGE" rather than a crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function toStyleMap(ax: AxiomContext, input: AnsiText): StyleMapResult {
  const result = new StyleMapResult();
  const text = input.getText() ?? '';
  const sizeErr = checkTextSize(text);
  if (sizeErr) {
    result.setError(sizeErr);
    return result;
  }

  const entries = Anser.ansiToJson(text, { json: true, remove_empty: true });
  let plainText = '';
  const ranges: StyleRange[] = [];
  for (const entry of entries) {
    const start = plainText.length;
    plainText += entry.content;
    const end = plainText.length;
    if (end === start) continue; // zero-length run, nothing to record
    const hasStyle = !!entry.fg || !!entry.bg || (entry.decorations && entry.decorations.length > 0);
    if (!hasStyle) continue;
    const range = new StyleRange();
    range.setStart(start);
    range.setEnd(end);
    if (entry.fg) range.setFg(entry.fg);
    if (entry.bg) range.setBg(entry.bg);
    if (entry.decorations && entry.decorations.length) {
      range.setDecorationsList(entry.decorations);
    }
    ranges.push(range);
  }
  result.setPlainText(plainText);
  result.setStylesList(ranges);
  return result;
}
