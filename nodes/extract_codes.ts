import { AnsiText, ExtractCodesResult, ExtractedCode } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { ANY_ESCAPE_RE, isSgr, parseSgrParams } from './_shared';

/**
 * Lists every distinct SGR (color/style) escape sequence used in the input,
 * in first-occurrence order, each with its raw form (e.g. "\x1b[1;31m"),
 * parsed semicolon/colon-separated numeric parameters, and how many times it
 * occurs. Non-SGR sequences (cursor movement, OSC) are not included — use
 * ClassifyEscapes to inspect those.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractCodes(ax: AxiomContext, input: AnsiText): ExtractCodesResult {
  const result = new ExtractCodesResult();
  const text = input.getText() ?? '';

  const order: string[] = [];
  const counts = new Map<string, number>();
  const matches = text.match(ANY_ESCAPE_RE) ?? [];
  for (const raw of matches) {
    if (!isSgr(raw)) continue;
    if (!counts.has(raw)) {
      order.push(raw);
      counts.set(raw, 0);
    }
    counts.set(raw, counts.get(raw)! + 1);
  }

  const codes: ExtractedCode[] = order.map((raw) => {
    const code = new ExtractedCode();
    code.setRaw(raw);
    code.setParamsList(parseSgrParams(raw));
    code.setOccurrences(counts.get(raw)!);
    return code;
  });
  result.setCodesList(codes);
  return result;
}
