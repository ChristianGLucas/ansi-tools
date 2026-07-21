import Anser from 'anser';
import { ColorCodeRequest } from '../gen/messages_pb';
import { colorCodeToRgb } from './color_code_to_rgb';
import { ctx, ESC } from './testkit';

// Cross-checks this node's hand-rolled palette math against anser — a
// second, independently-authored implementation of the same public xterm
// standard — by parsing the SGR sequence anser resolves for the same code
// and comparing its "r, g, b" string to this node's r/g/b/hex. This node's
// own runtime code never calls anser, so this is a genuine independent
// oracle, not a self-consistency check.
function anserResolvedRgb(sgrCode: string): [number, number, number] {
  const entries = Anser.ansiToJson(`${ESC}[${sgrCode}mX`, { json: true, remove_empty: true });
  const fg = entries.find((e) => e.fg)?.fg;
  if (!fg) throw new Error(`anser did not resolve a color for SGR ${sgrCode}`);
  const [r, g, b] = fg.split(',').map((s) => parseInt(s.trim(), 10));
  return [r, g, b];
}

describe('ColorCodeToRgb', () => {
  it('basic16 index 1 (red) matches anser\'s independent resolution of SGR 31', () => {
    const [r, g, b] = anserResolvedRgb('31');
    const input = new ColorCodeRequest();
    input.setMode('basic16');
    input.setIndex(1);
    const result = colorCodeToRgb(ctx, input);
    expect(result.getError()).toBe('');
    expect([result.getR(), result.getG(), result.getB()]).toEqual([r, g, b]);
    expect(result.getHex()).toBe('#bb0000');
  });

  it('basic16 index 9 (bright red) matches anser\'s independent resolution of SGR 91', () => {
    const [r, g, b] = anserResolvedRgb('91');
    const input = new ColorCodeRequest();
    input.setMode('basic16');
    input.setIndex(9);
    const result = colorCodeToRgb(ctx, input);
    expect([result.getR(), result.getG(), result.getB()]).toEqual([r, g, b]);
  });

  it('256-palette index 196 matches anser\'s independent resolution of SGR 38;5;196, and equals the hand-computed 6x6x6-cube value', () => {
    const [r, g, b] = anserResolvedRgb('38;5;196');
    expect([r, g, b]).toEqual([255, 0, 0]); // hand-derived: i=180, r=5->255,g=0->0,b=0->0
    const input = new ColorCodeRequest();
    input.setMode('256');
    input.setIndex(196);
    const result = colorCodeToRgb(ctx, input);
    expect([result.getR(), result.getG(), result.getB()]).toEqual([r, g, b]);
    expect(result.getHex()).toBe('#ff0000');
  });

  it('256-palette index 244 (grayscale ramp) matches anser\'s independent resolution', () => {
    const [r, g, b] = anserResolvedRgb('38;5;244');
    const input = new ColorCodeRequest();
    input.setMode('256');
    input.setIndex(244);
    const result = colorCodeToRgb(ctx, input);
    expect([result.getR(), result.getG(), result.getB()]).toEqual([r, g, b]);
    expect(r).toBe(g); // grayscale: r == g == b
    expect(g).toBe(b);
  });

  it('truecolor mode is a validating passthrough', () => {
    const input = new ColorCodeRequest();
    input.setMode('truecolor');
    input.setR(12);
    input.setG(200);
    input.setB(77);
    const result = colorCodeToRgb(ctx, input);
    expect(result.getError()).toBe('');
    expect([result.getR(), result.getG(), result.getB()]).toEqual([12, 200, 77]);
    expect(result.getHex()).toBe('#0cc84d');
  });

  it('returns INVALID_MODE for an unrecognized mode', () => {
    const input = new ColorCodeRequest();
    input.setMode('rgb565');
    const result = colorCodeToRgb(ctx, input);
    expect(result.getError()).toBe('INVALID_MODE');
    expect(result.getR()).toBe(0);
    expect(result.getHex()).toBe('');
  });

  it('returns INDEX_OUT_OF_RANGE for basic16 index 16 (only 0-15 valid)', () => {
    const input = new ColorCodeRequest();
    input.setMode('basic16');
    input.setIndex(16);
    const result = colorCodeToRgb(ctx, input);
    expect(result.getError()).toBe('INDEX_OUT_OF_RANGE');
  });

  it('returns INDEX_OUT_OF_RANGE for 256-palette index 256 (only 0-255 valid)', () => {
    const input = new ColorCodeRequest();
    input.setMode('256');
    input.setIndex(256);
    const result = colorCodeToRgb(ctx, input);
    expect(result.getError()).toBe('INDEX_OUT_OF_RANGE');
  });

  it('returns CHANNEL_OUT_OF_RANGE for a truecolor channel above 255', () => {
    const input = new ColorCodeRequest();
    input.setMode('truecolor');
    input.setR(256);
    input.setG(0);
    input.setB(0);
    const result = colorCodeToRgb(ctx, input);
    expect(result.getError()).toBe('CHANNEL_OUT_OF_RANGE');
  });

  it('is deterministic across repeated invocations', () => {
    const input = new ColorCodeRequest();
    input.setMode('256');
    input.setIndex(100);
    const r1 = colorCodeToRgb(ctx, input);
    const r2 = colorCodeToRgb(ctx, input);
    expect(r1.getHex()).toBe(r2.getHex());
  });
});
