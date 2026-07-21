import { AnsiText } from '../gen/messages_pb';
import { toStyleMap } from './to_style_map';
import { ctx, sgr, RESET } from './testkit';
import { MAX_TEXT_LENGTH } from './_shared';

describe('ToStyleMap', () => {
  it('produces plain_text and a hand-verified offset range for a single styled run', () => {
    const raw = `${sgr('31')}Red${RESET} plain`;
    const input = new AnsiText();
    input.setText(raw);
    const result = toStyleMap(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getPlainText()).toBe('Red plain');
    const styles = result.getStylesList();
    expect(styles.length).toBe(1);
    // "Red" occupies plain_text[0:3].
    expect(styles[0].getStart()).toBe(0);
    expect(styles[0].getEnd()).toBe(3);
    expect(styles[0].getFg()).toBe('187, 0, 0');
    // Confirm the range's text truly is "Red" by slicing plain_text with
    // its own reported offsets (independent cross-check within the result).
    expect(result.getPlainText().slice(styles[0].getStart(), styles[0].getEnd())).toBe('Red');
  });

  it('two separated styled runs produce two non-overlapping ranges at the correct offsets', () => {
    const raw = `${sgr('32')}green${RESET} gap ${sgr('34')}blue${RESET}`;
    const input = new AnsiText();
    input.setText(raw);
    const result = toStyleMap(ctx, input);
    expect(result.getPlainText()).toBe('green gap blue');
    const styles = result.getStylesList();
    expect(styles.length).toBe(2);
    expect([styles[0].getStart(), styles[0].getEnd()]).toEqual([0, 5]);
    expect(result.getPlainText().slice(0, 5)).toBe('green');
    expect([styles[1].getStart(), styles[1].getEnd()]).toEqual([10, 14]);
    expect(result.getPlainText().slice(10, 14)).toBe('blue');
  });

  it('returns an empty styles list for text with no ANSI styling', () => {
    const input = new AnsiText();
    input.setText('plain only');
    const result = toStyleMap(ctx, input);
    expect(result.getPlainText()).toBe('plain only');
    expect(result.getStylesList()).toEqual([]);
  });

  it('returns the INPUT_TOO_LARGE structured error for input over the 2 MiB cap', () => {
    const input = new AnsiText();
    input.setText('a'.repeat(MAX_TEXT_LENGTH + 1));
    const result = toStyleMap(ctx, input);
    expect(result.getError()).toBe('INPUT_TOO_LARGE');
  });
});
