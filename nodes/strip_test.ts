import { AnsiText } from '../gen/messages_pb';
import { strip } from './strip';
import { ctx, ESC, sgr, RESET } from './testkit';
import { MAX_TEXT_LENGTH } from './_shared';

describe('Strip', () => {
  it('removes SGR sequences and returns plain text, with a hand-counted codes_removed (independent oracle: expected values derived by reading the escape sequences directly, not by calling any regex in the implementation)', () => {
    // Hand-constructed: bold-red "Hello" + reset + " World" -> exactly two
    // escape-sequence occurrences (the opening SGR and the reset), plain
    // text "Hello World".
    const raw = `${sgr('1;31')}Hello${RESET} World`;
    const input = new AnsiText();
    input.setText(raw);
    const result = strip(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getPlainText()).toBe('Hello World');
    expect(result.getCodesRemoved()).toBe(2);
  });

  it('leaves an incomplete trailing escape sequence as literal text instead of crashing', () => {
    const raw = `Hello${ESC}[`;
    const input = new AnsiText();
    input.setText(raw);
    const result = strip(ctx, input);
    expect(result.getError()).toBe('');
    // strip-ansi does not consume a CSI introducer with no final byte.
    expect(result.getPlainText()).toBe(`Hello${ESC}[`);
  });

  it('is a no-op (codes_removed = 0) on text with no escape sequences', () => {
    const input = new AnsiText();
    input.setText('plain text, nothing to strip');
    const result = strip(ctx, input);
    expect(result.getPlainText()).toBe('plain text, nothing to strip');
    expect(result.getCodesRemoved()).toBe(0);
  });

  it('handles an empty string', () => {
    const input = new AnsiText();
    input.setText('');
    const result = strip(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getPlainText()).toBe('');
    expect(result.getCodesRemoved()).toBe(0);
  });

  it('strips a cursor-movement (non-SGR CSI) and an OSC hyperlink sequence too, not just SGR', () => {
    const BEL = '\x07';
    const raw = `${ESC}[2J${ESC}]8;;https://example.com${BEL}link${ESC}]8;;${BEL}`;
    const input = new AnsiText();
    input.setText(raw);
    const result = strip(ctx, input);
    expect(result.getPlainText()).toBe('link');
    expect(result.getCodesRemoved()).toBe(3);
  });

  it('returns the INPUT_TOO_LARGE structured error (not a crash) for input over the 2 MiB cap', () => {
    const input = new AnsiText();
    input.setText('a'.repeat(MAX_TEXT_LENGTH + 1));
    const result = strip(ctx, input);
    expect(result.getError()).toBe('INPUT_TOO_LARGE');
    expect(result.getPlainText()).toBe('');
  });

  it('is deterministic: two invocations on the same input return identical results', () => {
    const raw = `${sgr('32')}green${RESET}`;
    const input = new AnsiText();
    input.setText(raw);
    const r1 = strip(ctx, input);
    const r2 = strip(ctx, input);
    expect(r1.getPlainText()).toBe(r2.getPlainText());
    expect(r1.getCodesRemoved()).toBe(r2.getCodesRemoved());
  });
});
