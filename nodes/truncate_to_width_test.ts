import { TruncateRequest } from '../gen/messages_pb';
import { truncateToWidth } from './truncate_to_width';
import { ctx, sgr, RESET } from './testkit';
import { MAX_TEXT_LENGTH } from './_shared';

describe('TruncateToWidth', () => {
  it('truncates styled text to the requested width and closes the still-open style (independently verifiable: plain-text portion is exactly "Hel", and the result must contain no unclosed foreground escape after the last visible character)', () => {
    const input = new TruncateRequest();
    input.setText(`${sgr('31')}Hello${RESET}`);
    input.setWidth(3);
    const result = truncateToWidth(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getTruncated()).toBe(true);
    // Strip escapes by hand (simple SGR-only regex, independent of the
    // package's own ANY_ESCAPE_RE) to check the visible content.
    const plain = result.getText().replace(/\x1b\[[0-9;]*m/g, '');
    expect(plain).toBe('Hel');
    // A style reset (39 = default fg, or 0 = full reset) must appear after
    // the content — the output must not leave 31 open past the cut.
    expect(/\x1b\[(0|39)m$/.test(result.getText())).toBe(true);
  });

  it('leaves text byte-for-byte unchanged when width already covers the full visible width', () => {
    const raw = `${sgr('32')}short${RESET}`;
    const input = new TruncateRequest();
    input.setText(raw);
    input.setWidth(100);
    const result = truncateToWidth(ctx, input);
    expect(result.getTruncated()).toBe(false);
    expect(result.getText()).toBe(raw);
  });

  it('width 0 truncates to an empty, self-contained string', () => {
    const input = new TruncateRequest();
    input.setText(`${sgr('31')}Hello${RESET}`);
    input.setWidth(0);
    const result = truncateToWidth(ctx, input);
    expect(result.getTruncated()).toBe(true);
    expect(result.getText().replace(/\x1b\[[0-9;]*m/g, '')).toBe('');
  });

  it('a wide (CJK) character is not split — truncating to width 1 in the middle of a 2-column character drops it entirely', () => {
    const input = new TruncateRequest();
    input.setText('你好'); // two wide chars, each 2 columns wide
    input.setWidth(1);
    const result = truncateToWidth(ctx, input);
    // Cutting at column 1 lands inside the first wide character; slice-ansi
    // does not emit a half character, so the visible result is empty.
    expect(result.getText()).toBe('');
  });

  it('returns INVALID_WIDTH and echoes the original input unchanged for a negative width', () => {
    const raw = `${sgr('31')}Hello${RESET}`;
    const input = new TruncateRequest();
    input.setText(raw);
    input.setWidth(-1);
    const result = truncateToWidth(ctx, input);
    expect(result.getError()).toBe('INVALID_WIDTH');
    expect(result.getText()).toBe(raw);
    expect(result.getTruncated()).toBe(false);
  });

  it('returns the INPUT_TOO_LARGE structured error for input over the 2 MiB cap', () => {
    const input = new TruncateRequest();
    input.setText('a'.repeat(MAX_TEXT_LENGTH + 1));
    input.setWidth(5);
    const result = truncateToWidth(ctx, input);
    expect(result.getError()).toBe('INPUT_TOO_LARGE');
  });
});
