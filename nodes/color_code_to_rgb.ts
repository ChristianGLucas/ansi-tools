import { ColorCodeRequest, ColorRgbResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { BASIC16_PALETTE, palette256ToRgb, toHex } from './_shared';

function isByte(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= 255;
}

/**
 * Converts an ANSI color reference in any of the three color models into
 * concrete RGB and hex — mode "basic16" (index 0-15, the standard 8 colors
 * plus their bright variants), mode "256" (index 0-255, the standard xterm
 * palette — 0-15 system colors, 16-231 a 6x6x6 RGB cube, 232-255 a 24-step
 * grayscale ramp), or mode "truecolor" (r, g, b supplied directly, each
 * validated to 0-255 and passed through). `error` is "INVALID_MODE" for an
 * unrecognized mode, "INDEX_OUT_OF_RANGE" for an out-of-range basic16/256
 * index, or "CHANNEL_OUT_OF_RANGE" for an out-of-range truecolor channel —
 * in every case r/g/b/hex are left zero-valued.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function colorCodeToRgb(ax: AxiomContext, input: ColorCodeRequest): ColorRgbResult {
  const result = new ColorRgbResult();
  const mode = input.getMode() ?? '';

  let rgb: [number, number, number] | null;
  if (mode === 'basic16') {
    const index = input.getIndex() ?? 0;
    if (!Number.isInteger(index) || index < 0 || index >= BASIC16_PALETTE.length) {
      result.setError('INDEX_OUT_OF_RANGE');
      return result;
    }
    rgb = [...BASIC16_PALETTE[index]];
  } else if (mode === '256') {
    rgb = palette256ToRgb(input.getIndex() ?? 0);
    if (rgb === null) {
      result.setError('INDEX_OUT_OF_RANGE');
      return result;
    }
  } else if (mode === 'truecolor') {
    const r = input.getR() ?? 0;
    const g = input.getG() ?? 0;
    const b = input.getB() ?? 0;
    if (!isByte(r) || !isByte(g) || !isByte(b)) {
      result.setError('CHANNEL_OUT_OF_RANGE');
      return result;
    }
    rgb = [r, g, b];
  } else {
    result.setError('INVALID_MODE');
    return result;
  }

  const [r, g, b] = rgb;
  result.setR(r);
  result.setG(g);
  result.setB(b);
  result.setHex(toHex(r, g, b));
  return result;
}
