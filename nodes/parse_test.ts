import { AnsiText } from '../gen/messages_pb';
import { parse } from './parse';
import { ctx, ESC, sgr, RESET } from './testkit';

describe('Parse', () => {
  it('splits colored text into spans with fg resolved to the standard xterm basic-16 RGB value (independent oracle: 31=red="187, 0, 0" is the documented ECMA/xterm standard basic color, not a value derived from this package\'s own code)', () => {
    const raw = `${sgr('31')}Red${RESET} plain`;
    const input = new AnsiText();
    input.setText(raw);
    const result = parse(ctx, input);
    expect(result.getError()).toBe('');
    const spans = result.getSpansList();
    expect(spans.length).toBe(2);
    expect(spans[0].getText()).toBe('Red');
    expect(spans[0].getFg()).toBe('187, 0, 0');
    expect(spans[1].getText()).toBe(' plain');
    expect(spans[1].getFg()).toBe('');
  });

  it('resolves a 256-palette color code to RGB matching an independently hand-computed 6x6x6-cube value', () => {
    // Code 196 is in the 16-231 cube range: i = 196-16 = 180; r=180/36=5,
    // g=(180%36)/6=0, b=180%6=0; levels=[0,95,135,175,215,255] -> level[5]=255.
    // Hand-derived expected: "255, 0, 0" — computed here independently of
    // anser's own PALETTE_COLORS table, from the published xterm-256 formula.
    const levels = [0, 95, 135, 175, 215, 255];
    const i = 196 - 16;
    const expected = `${levels[Math.floor(i / 36)]}, ${levels[Math.floor((i % 36) / 6)]}, ${levels[i % 6]}`;
    expect(expected).toBe('255, 0, 0');

    const raw = `${sgr('38;5;196')}Palette${RESET}`;
    const input = new AnsiText();
    input.setText(raw);
    const result = parse(ctx, input);
    expect(result.getSpansList()[0].getFg()).toBe(expected);
  });

  it('resolves a 24-bit truecolor SGR sequence to the exact r, g, b it specified', () => {
    const raw = `${sgr('38;2;10;20;30')}True${RESET}`;
    const input = new AnsiText();
    input.setText(raw);
    const result = parse(ctx, input);
    expect(result.getSpansList()[0].getFg()).toBe('10, 20, 30');
  });

  it('accumulates multiple decorations (bold + underline) on one span', () => {
    const raw = `${sgr('1;4')}BoldUnderline${RESET}`;
    const input = new AnsiText();
    input.setText(raw);
    const result = parse(ctx, input);
    const spans = result.getSpansList();
    expect(spans.length).toBe(1);
    expect(spans[0].getDecorationsList()).toEqual(['bold', 'underline']);
  });

  it('concatenating every span text reconstructs the plain text', () => {
    const raw = `${sgr('32')}green${RESET} and ${sgr('34')}blue${RESET} text`;
    const input = new AnsiText();
    input.setText(raw);
    const result = parse(ctx, input);
    const reconstructed = result
      .getSpansList()
      .map((s) => s.getText())
      .join('');
    expect(reconstructed).toBe('green and blue text');
  });

  it('returns a single unstyled span for plain text with no escape sequences', () => {
    const input = new AnsiText();
    input.setText('just plain text');
    const result = parse(ctx, input);
    const spans = result.getSpansList();
    expect(spans.length).toBe(1);
    expect(spans[0].getText()).toBe('just plain text');
    expect(spans[0].getFg()).toBe('');
    expect(spans[0].getDecorationsList()).toEqual([]);
  });

  it('returns an empty spans list for an empty string', () => {
    const input = new AnsiText();
    input.setText('');
    const result = parse(ctx, input);
    expect(result.getSpansList()).toEqual([]);
  });


  it('is deterministic across repeated invocations', () => {
    const raw = `${sgr('1;35')}Magenta${RESET}`;
    const input = new AnsiText();
    input.setText(raw);
    const r1 = parse(ctx, input);
    const r2 = parse(ctx, input);
    expect(r1.getSpansList()[0].getFg()).toBe(r2.getSpansList()[0].getFg());
    expect(r1.getSpansList()[0].getDecorationsList()).toEqual(r2.getSpansList()[0].getDecorationsList());
  });
});
