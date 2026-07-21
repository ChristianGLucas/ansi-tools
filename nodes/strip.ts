import stripAnsi from 'strip-ansi';
import { AnsiText, StripResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { checkTextSize, ANY_ESCAPE_RE } from './_shared';

/**
 * Removes every ANSI escape sequence (SGR color/style, cursor movement, OSC
 * hyperlinks/titles — anything ansi-regex recognizes) from the input and
 * returns the plain text, plus a count of how many escape-sequence
 * occurrences were removed. A malformed or incomplete trailing escape
 * sequence (e.g. a truncated "\x1b[" with no final byte) is left in place as
 * literal text rather than causing an error — matching strip-ansi's own
 * behavior. `text` over the 2 MiB cap yields `error` = "INPUT_TOO_LARGE"
 * rather than a crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function strip(ax: AxiomContext, input: AnsiText): StripResult {
  const result = new StripResult();
  const text = input.getText() ?? '';
  const sizeErr = checkTextSize(text);
  if (sizeErr) {
    result.setError(sizeErr);
    return result;
  }

  const matches = text.match(ANY_ESCAPE_RE);
  result.setCodesRemoved(matches ? matches.length : 0);
  result.setPlainText(stripAnsi(text));
  return result;
}
