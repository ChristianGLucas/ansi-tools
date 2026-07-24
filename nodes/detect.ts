import { AnsiText, DetectResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { ANY_ESCAPE_RE } from './_shared';

/**
 * Reports whether the input contains any ANSI escape sequence at all, and
 * how many occurrences. Useful as a cheap pre-check before deciding whether
 * to run Parse/Strip/ToHtml on a string.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function detect(ax: AxiomContext, input: AnsiText): DetectResult {
  const result = new DetectResult();
  const text = input.getText() ?? '';

  const matches = text.match(ANY_ESCAPE_RE);
  const count = matches ? matches.length : 0;
  result.setHasAnsi(count > 0);
  result.setCodeCount(count);
  return result;
}
