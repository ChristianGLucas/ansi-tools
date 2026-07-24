import sliceAnsi from 'slice-ansi';
import stringWidth from 'string-width';
import { TruncateRequest, TruncateResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { MAX_COLUMN } from './_shared';

/**
 * Truncates text to at most `width` visible columns without splitting a
 * multi-byte escape sequence and without leaving an SGR style open past the
 * cut — any color/style still active at the truncation point is explicitly
 * reset in the output, so the returned text is always self-contained. When
 * the input's visible width is already at or below `width`, the input is
 * returned byte-for-byte unchanged (no reset codes are added). `error` is
 * "INVALID_WIDTH" (and `text` echoes the original input unchanged) when
 * `width` is negative or exceeds 100,000,000.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function truncateToWidth(ax: AxiomContext, input: TruncateRequest): TruncateResult {
  const result = new TruncateResult();
  const text = input.getText() ?? '';
  const width = input.getWidth() ?? 0;

  if (width < 0 || width > MAX_COLUMN) {
    result.setError('INVALID_WIDTH');
    result.setText(text);
    result.setTruncated(false);
    return result;
  }

  const inputWidth = stringWidth(text);
  if (width >= inputWidth) {
    result.setText(text);
    result.setTruncated(false);
    return result;
  }

  result.setText(sliceAnsi(text, 0, width));
  result.setTruncated(true);
  return result;
}
