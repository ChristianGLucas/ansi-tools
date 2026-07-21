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

  // Adversarial-review finding (fixed by correcting the shipped claim, not
  // the code — this is inherited ansi-regex 6.2.2 behavior, verified
  // independently against the raw library, not a bug this node introduces).
  // A bare truncated introducer with NO digits is preserved (asserted
  // above); a CSI sequence truncated right after its numeric parameters
  // (no true final byte) is instead consumed as if complete, because
  // ansi-regex's final-byte character class also accepts a digit — so its
  // trailing digit(s) are silently dropped rather than kept as text.
  it('a CSI sequence truncated right after its digits (no true final byte) is consumed, not preserved -- its trailing digits are dropped', () => {
    const input = new AnsiText();
    input.setText(`Hello${ESC}[38;5`); // truncated 256-color code, no "m"
    const result = strip(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getPlainText()).toBe('Hello'); // "38;5" is NOT preserved
    expect(result.getCodesRemoved()).toBe(1);
  });

  it('a single truncated numeric-parameter digit is likewise consumed rather than preserved', () => {
    const input = new AnsiText();
    input.setText(`Hello${ESC}[3`);
    const result = strip(ctx, input);
    expect(result.getPlainText()).toBe('Hello');
  });

  it('an OSC sequence missing its BEL/ST terminator is not matched as OSC, but the CSI alternative can still eat one leading character of the following real text', () => {
    const input = new AnsiText();
    // No BEL/ST anywhere -- deliberately unterminated hyperlink escape.
    input.setText(`${ESC}]8;;https://example.com no terminator here`);
    const result = strip(ctx, input);
    // ']' is a valid CSI intermediate byte and the digit "8" plus two empty
    // ';' separators are valid CSI params, so "\x1b]8;;h" (ending on the
    // "h" of "https", which falls in the CSI final-byte letter range)
    // matches as one CSI sequence and is removed -- dropping that "h".
    expect(result.getPlainText()).toBe('ttps://example.com no terminator here');
    expect(result.getCodesRemoved()).toBe(1);
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
