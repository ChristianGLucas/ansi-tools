import stringWidth from 'string-width';
import { AnsiText, WidthResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { checkTextSize } from './_shared';

/**
 * Computes the visible display width of text in terminal columns, ignoring
 * ANSI escape sequences (0 columns) and correctly counting East-Asian
 * wide/fullwidth characters and most emoji as 2 columns rather than 1.
 * `text` over the 2 MiB cap yields `error` = "INPUT_TOO_LARGE" rather than a
 * crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function visibleWidth(ax: AxiomContext, input: AnsiText): WidthResult {
  const result = new WidthResult();
  const text = input.getText() ?? '';
  const sizeErr = checkTextSize(text);
  if (sizeErr) {
    result.setError(sizeErr);
    return result;
  }

  result.setWidth(stringWidth(text));
  return result;
}
