import stringWidth from 'string-width';
import { AnsiText, WidthResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';

/**
 * Computes the visible display width of text in terminal columns, ignoring
 * ANSI escape sequences (0 columns) and correctly counting East-Asian
 * wide/fullwidth characters and most emoji as 2 columns rather than 1.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function visibleWidth(ax: AxiomContext, input: AnsiText): WidthResult {
  const result = new WidthResult();
  const text = input.getText() ?? '';

  result.setWidth(stringWidth(text));
  return result;
}
