import { ClassifyRequest, ClassifyResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { checkTextSize, ANY_ESCAPE_RE, isOsc, isSgr } from './_shared';

/**
 * Buckets every escape sequence in the input into three categories per
 * ECMA-48 — SGR color/style (a CSI sequence whose final byte is "m"), other
 * CSI (cursor movement, erase, scroll — any other CSI final byte), and OSC
 * (hyperlinks, window-title-setting, terminated by BEL/ST) — and reports a
 * count per category. Independently, strips only the categories the caller
 * opts into (strip_sgr/strip_cursor/strip_osc) and returns that as
 * stripped_text, leaving unrequested categories intact; requesting nothing
 * returns the input unchanged. `text` over the 2 MiB cap yields `error` =
 * "INPUT_TOO_LARGE" rather than a crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function classifyEscapes(ax: AxiomContext, input: ClassifyRequest): ClassifyResult {
  const result = new ClassifyResult();
  const text = input.getText() ?? '';
  const sizeErr = checkTextSize(text);
  if (sizeErr) {
    result.setError(sizeErr);
    return result;
  }
  const stripSgr = input.getStripSgr() ?? false;
  const stripCursor = input.getStripCursor() ?? false;
  const stripOsc = input.getStripOsc() ?? false;

  let sgrCount = 0;
  let cursorCount = 0;
  let oscCount = 0;

  const strippedText = text.replace(ANY_ESCAPE_RE, (match) => {
    if (isOsc(match)) {
      oscCount++;
      return stripOsc ? '' : match;
    }
    if (isSgr(match)) {
      sgrCount++;
      return stripSgr ? '' : match;
    }
    cursorCount++;
    return stripCursor ? '' : match;
  });

  result.setSgrCount(sgrCount);
  result.setCursorCount(cursorCount);
  result.setOscCount(oscCount);
  result.setStrippedText(strippedText);
  return result;
}
