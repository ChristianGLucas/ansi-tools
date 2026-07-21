import { SliceRequest } from '../gen/messages_pb';
import { sliceByColumn } from './slice_by_column';
import { ctx, sgr, RESET } from './testkit';
import { MAX_TEXT_LENGTH } from './_shared';

describe('SliceByColumn', () => {
  it('slices a plain (no-ANSI) string identically to JS String.prototype.slice (independent oracle)', () => {
    const input = new SliceRequest();
    input.setText('hello world');
    input.setStart(2);
    input.setEnd(5);
    const result = sliceByColumn(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getText()).toBe('hello world'.slice(2, 5));
    expect(result.getText()).toBe('llo');
  });

  it('slices a styled range out of the middle, preserving color and closing it', () => {
    const input = new SliceRequest();
    input.setText(`${sgr('31')}Hello${RESET} World`);
    input.setStart(0);
    input.setEnd(3);
    const result = sliceByColumn(ctx, input);
    const plain = result.getText().replace(/\x1b\[[0-9;]*m/g, '');
    expect(plain).toBe('Hel');
  });

  it('an end at or beyond the visible width slices through to the end', () => {
    const input = new SliceRequest();
    input.setText('hello');
    input.setStart(2);
    input.setEnd(1000);
    const result = sliceByColumn(ctx, input);
    expect(result.getText()).toBe('llo');
  });

  it('start === end returns an empty string', () => {
    const input = new SliceRequest();
    input.setText('hello');
    input.setStart(2);
    input.setEnd(2);
    const result = sliceByColumn(ctx, input);
    expect(result.getText()).toBe('');
  });

  it('returns INVALID_RANGE for a negative start', () => {
    const input = new SliceRequest();
    input.setText('hello');
    input.setStart(-1);
    input.setEnd(3);
    const result = sliceByColumn(ctx, input);
    expect(result.getError()).toBe('INVALID_RANGE');
    expect(result.getText()).toBe('');
  });

  it('returns INVALID_RANGE when end < start', () => {
    const input = new SliceRequest();
    input.setText('hello');
    input.setStart(4);
    input.setEnd(1);
    const result = sliceByColumn(ctx, input);
    expect(result.getError()).toBe('INVALID_RANGE');
  });

  it('returns the INPUT_TOO_LARGE structured error for input over the 2 MiB cap', () => {
    const input = new SliceRequest();
    input.setText('a'.repeat(MAX_TEXT_LENGTH + 1));
    input.setStart(0);
    input.setEnd(1);
    const result = sliceByColumn(ctx, input);
    expect(result.getError()).toBe('INPUT_TOO_LARGE');
  });
});
