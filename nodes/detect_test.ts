import { AnsiText } from '../gen/messages_pb';
import { detect } from './detect';
import { ctx, ESC, sgr, RESET } from './testkit';
import { MAX_TEXT_LENGTH } from './_shared';

describe('Detect', () => {
  it('reports has_ansi=false, code_count=0 for plain text', () => {
    const input = new AnsiText();
    input.setText('nothing special here');
    const result = detect(ctx, input);
    expect(result.getHasAnsi()).toBe(false);
    expect(result.getCodeCount()).toBe(0);
  });

  it('reports has_ansi=true with a hand-counted code_count (independent oracle)', () => {
    const raw = `${sgr('1')}bold${RESET} then ${sgr('4')}underline${RESET}`;
    const input = new AnsiText();
    input.setText(raw);
    const result = detect(ctx, input);
    expect(result.getHasAnsi()).toBe(true);
    // Hand count: 4 escape sequences total (2 opens + 2 resets).
    expect(result.getCodeCount()).toBe(4);
  });

  it('handles an empty string', () => {
    const input = new AnsiText();
    input.setText('');
    const result = detect(ctx, input);
    expect(result.getHasAnsi()).toBe(false);
    expect(result.getCodeCount()).toBe(0);
  });

  it('counts an OSC hyperlink as ANSI even with zero SGR codes present', () => {
    const BEL = '\x07';
    const raw = `${ESC}]8;;https://example.com${BEL}click${ESC}]8;;${BEL}`;
    const input = new AnsiText();
    input.setText(raw);
    const result = detect(ctx, input);
    expect(result.getHasAnsi()).toBe(true);
    expect(result.getCodeCount()).toBe(2);
  });

  it('returns the INPUT_TOO_LARGE structured error for input over the 2 MiB cap', () => {
    const input = new AnsiText();
    input.setText('a'.repeat(MAX_TEXT_LENGTH + 1));
    const result = detect(ctx, input);
    expect(result.getError()).toBe('INPUT_TOO_LARGE');
  });
});
