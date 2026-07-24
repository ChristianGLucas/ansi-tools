import { AnsiText } from '../gen/messages_pb';
import { extractCodes } from './extract_codes';
import { ctx, ESC, sgr, RESET } from './testkit';

describe('ExtractCodes', () => {
  it('lists distinct SGR codes in first-occurrence order with hand-verified raw form, params, and occurrence counts', () => {
    // "1;31" appears twice, "0" (reset) once — 2 distinct codes expected,
    // in first-occurrence order.
    const raw = `${sgr('1;31')}A${sgr('1;31')}B${RESET}`;
    const input = new AnsiText();
    input.setText(raw);
    const result = extractCodes(ctx, input);
    expect(result.getError()).toBe('');
    const codes = result.getCodesList();
    expect(codes.length).toBe(2);
    expect(codes[0].getRaw()).toBe(`${ESC}[1;31m`);
    expect(codes[0].getParamsList()).toEqual([1, 31]);
    expect(codes[0].getOccurrences()).toBe(2);
    expect(codes[1].getRaw()).toBe(`${ESC}[0m`);
    expect(codes[1].getParamsList()).toEqual([0]);
    expect(codes[1].getOccurrences()).toBe(1);
  });

  it('excludes non-SGR sequences (cursor movement, OSC) from the result', () => {
    const BEL = '\x07';
    const raw = `${ESC}[2J${sgr('32')}green${RESET}${ESC}]8;;https://x${BEL}link${ESC}]8;;${BEL}`;
    const input = new AnsiText();
    input.setText(raw);
    const result = extractCodes(ctx, input);
    const codes = result.getCodesList();
    expect(codes.map((c) => c.getRaw())).toEqual([`${ESC}[32m`, `${ESC}[0m`]);
  });

  it('a bare reset "\\x1b[m" (no digits) has an empty params list', () => {
    const raw = `${ESC}[mtext`;
    const input = new AnsiText();
    input.setText(raw);
    const result = extractCodes(ctx, input);
    const codes = result.getCodesList();
    expect(codes.length).toBe(1);
    expect(codes[0].getRaw()).toBe(`${ESC}[m`);
    expect(codes[0].getParamsList()).toEqual([]);
  });

  it('returns an empty codes list for text with no escape sequences', () => {
    const input = new AnsiText();
    input.setText('plain text');
    const result = extractCodes(ctx, input);
    expect(result.getCodesList()).toEqual([]);
  });

});
