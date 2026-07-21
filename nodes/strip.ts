import stripAnsi from 'strip-ansi';
import { AnsiText, StripResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { checkTextSize, ANY_ESCAPE_RE } from './_shared';

/**
 * Removes every ANSI escape sequence (SGR color/style, cursor movement, OSC
 * hyperlinks/titles — anything ansi-regex recognizes) from the input and
 * returns the plain text, plus a count of how many escape-sequence
 * occurrences were removed. Never crashes or errors on malformed input, but
 * a truncated/malformed sequence is not always preserved byte-for-byte as
 * literal text: a bare, digit-free introducer like a trailing "\x1b[" with
 * nothing after it IS left in place; a CSI sequence truncated right after
 * its numeric parameters (no true final byte, e.g. "\x1b[38;5" with no
 * trailing "m") is instead matched and removed as if it were a complete
 * sequence, since ansi-regex's final-byte class also accepts a digit — so
 * its last digit(s) are silently dropped rather than kept as text. An OSC
 * sequence (e.g. a hyperlink) missing its BEL/ST terminator is not matched
 * as OSC at all, but part of it can still be consumed by the CSI
 * alternative, which can eat one leading character of whatever real text
 * follows. Both are inherited, verified behaviors of the underlying
 * ansi-regex pattern (not something this node adds on top), and both remain
 * deterministic and non-crashing. `text` over the 2 MiB cap yields `error` =
 * "INPUT_TOO_LARGE" rather than a crash.
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
