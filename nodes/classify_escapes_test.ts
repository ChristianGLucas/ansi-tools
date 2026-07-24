import { ClassifyRequest } from '../gen/messages_pb';
import { classifyEscapes } from './classify_escapes';
import { ctx, ESC, sgr, RESET } from './testkit';

const BEL = '\x07';

describe('ClassifyEscapes', () => {
  it('hand-counts one SGR, one cursor-movement CSI, and one OSC hyperlink correctly into their three separate buckets', () => {
    const raw = `${ESC}[2J${sgr('31')}Red${RESET}${ESC}]8;;https://example.com${BEL}link${ESC}]8;;${BEL}`;
    const input = new ClassifyRequest();
    input.setText(raw);
    const result = classifyEscapes(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getSgrCount()).toBe(2); // the "31" open and the reset
    expect(result.getCursorCount()).toBe(1); // "[2J"
    expect(result.getOscCount()).toBe(2); // hyperlink open + close
    // No strip_* flags set -> stripped_text equals the original input.
    expect(result.getStrippedText()).toBe(raw);
  });

  it('strips only the requested category, leaving the others intact', () => {
    const raw = `${ESC}[2J${sgr('31')}Red${RESET}`;
    const input = new ClassifyRequest();
    input.setText(raw);
    input.setStripSgr(true);
    const result = classifyEscapes(ctx, input);
    // SGR removed, cursor-movement CSI left intact.
    expect(result.getStrippedText()).toBe(`${ESC}[2JRed`);
  });

  it('stripping cursor and OSC but not SGR leaves only the color codes', () => {
    const raw = `${ESC}[2J${sgr('32')}Green${RESET}${ESC}]8;;https://x${BEL}link${ESC}]8;;${BEL}`;
    const input = new ClassifyRequest();
    input.setText(raw);
    input.setStripCursor(true);
    input.setStripOsc(true);
    const result = classifyEscapes(ctx, input);
    expect(result.getStrippedText()).toBe(`${sgr('32')}Green${RESET}link`);
  });

  it('a bare SGR reset "\\x1b[m" and a CSI final byte other than "m" are classified correctly', () => {
    const raw = `${ESC}[10;5H${ESC}[m`; // cursor position + bare SGR reset
    const input = new ClassifyRequest();
    input.setText(raw);
    const result = classifyEscapes(ctx, input);
    expect(result.getSgrCount()).toBe(1);
    expect(result.getCursorCount()).toBe(1);
    expect(result.getOscCount()).toBe(0);
  });

  it('all counts are zero and stripped_text is unchanged for plain text', () => {
    const input = new ClassifyRequest();
    input.setText('plain text');
    const result = classifyEscapes(ctx, input);
    expect(result.getSgrCount()).toBe(0);
    expect(result.getCursorCount()).toBe(0);
    expect(result.getOscCount()).toBe(0);
    expect(result.getStrippedText()).toBe('plain text');
  });

});
