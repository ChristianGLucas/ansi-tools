import {
  palette256ToRgb,
  BASIC16_PALETTE,
  parseSgrParams,
  toHex,
  isSgr,
  isOsc,
  ANY_ESCAPE_RE,
} from './_shared';

describe('_shared helpers', () => {
  describe('palette256ToRgb', () => {
    it('indices 0-15 delegate to BASIC16_PALETTE', () => {
      for (let i = 0; i < 16; i++) {
        expect(palette256ToRgb(i)).toEqual([...BASIC16_PALETTE[i]]);
      }
    });
    it('index 16 (cube origin) is black', () => {
      expect(palette256ToRgb(16)).toEqual([0, 0, 0]);
    });
    it('index 231 (cube max corner) is full white', () => {
      expect(palette256ToRgb(231)).toEqual([255, 255, 255]);
    });
    it('index 232 (grayscale start) is level 8', () => {
      expect(palette256ToRgb(232)).toEqual([8, 8, 8]);
    });
    it('index 255 (grayscale end) is level 238', () => {
      expect(palette256ToRgb(255)).toEqual([238, 238, 238]);
    });
    it('rejects out-of-range and non-integer indices', () => {
      expect(palette256ToRgb(-1)).toBeNull();
      expect(palette256ToRgb(256)).toBeNull();
      expect(palette256ToRgb(1.5)).toBeNull();
    });
  });

  describe('parseSgrParams', () => {
    it('parses a multi-param sequence', () => {
      expect(parseSgrParams('\x1b[1;31m')).toEqual([1, 31]);
    });
    it('parses a colon-separated truecolor sequence', () => {
      expect(parseSgrParams('\x1b[38:2:10:20:30m')).toEqual([38, 2, 10, 20, 30]);
    });
    it('returns [] for a bare reset', () => {
      expect(parseSgrParams('\x1b[m')).toEqual([]);
    });
  });

  describe('toHex', () => {
    it('pads single-digit hex components with a leading zero', () => {
      expect(toHex(0, 0, 0)).toBe('#000000');
      expect(toHex(1, 2, 3)).toBe('#010203');
      expect(toHex(255, 255, 255)).toBe('#ffffff');
    });
  });

  describe('isSgr / isOsc classification against ANY_ESCAPE_RE matches', () => {
    it('classifies an SGR sequence, a non-SGR CSI sequence, and an OSC sequence distinctly', () => {
      const BEL = '\x07';
      const text = `\x1b[2J\x1b[31m\x1b]8;;https://x${BEL}link\x1b]8;;${BEL}`;
      const matches = text.match(ANY_ESCAPE_RE)!;
      expect(matches.length).toBe(4);
      expect(isSgr(matches[0])).toBe(false); // [2J
      expect(isOsc(matches[0])).toBe(false);
      expect(isSgr(matches[1])).toBe(true); // [31m
      expect(isOsc(matches[1])).toBe(false);
      expect(isOsc(matches[2])).toBe(true); // ]8;;...BEL
      expect(isSgr(matches[2])).toBe(false);
    });
  });
});
