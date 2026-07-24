import sliceAnsi from 'slice-ansi';
import { SliceRequest, SliceResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { MAX_COLUMN } from './_shared';

/**
 * Extracts the visible-column range [start, end) of the input — like a
 * string slice, but counted in on-screen columns rather than
 * characters/bytes, with styling preserved and any style left open at either
 * cut point explicitly reset. `error` is "INVALID_RANGE" (and `text` is
 * empty) when start is negative, end is negative, end < start, or either
 * exceeds 100,000,000. An end at or beyond the text's visible width slices
 * through to the end.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function sliceByColumn(ax: AxiomContext, input: SliceRequest): SliceResult {
  const result = new SliceResult();
  const text = input.getText() ?? '';
  const start = input.getStart() ?? 0;
  const end = input.getEnd() ?? 0;

  if (start < 0 || end < 0 || end < start || start > MAX_COLUMN || end > MAX_COLUMN) {
    result.setError('INVALID_RANGE');
    return result;
  }

  result.setText(sliceAnsi(text, start, end));
  return result;
}
