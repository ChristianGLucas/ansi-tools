import { AnsiText } from '../gen/messages_pb';
import { visibleWidth } from './visible_width';
import { ctx, sgr, RESET } from './testkit';

describe('VisibleWidth', () => {
  it('width of plain ASCII text equals its character count (trivial hand-derived fact, independent of the implementation)', () => {
    const input = new AnsiText();
    input.setText('hello world');
    const result = visibleWidth(ctx, input);
    expect(result.getWidth()).toBe('hello world'.length);
  });

  it('escape sequences contribute 0 columns — width ignores them entirely', () => {
    const raw = `${sgr('1;31')}hello${RESET}`;
    const input = new AnsiText();
    input.setText(raw);
    const result = visibleWidth(ctx, input);
    expect(result.getWidth()).toBe(5); // just "hello"
  });

  it('East-Asian wide characters count as 2 columns each (independently documented Unicode East Asian Width property, not this package\'s own logic)', () => {
    const input = new AnsiText();
    input.setText('你好'); // 你好 — two wide CJK characters
    const result = visibleWidth(ctx, input);
    expect(result.getWidth()).toBe(4);
  });

  it('a mix of wide characters, plain ASCII, and color codes sums correctly', () => {
    const raw = `${sgr('32')}你好hi${RESET}`;
    const input = new AnsiText();
    input.setText(raw);
    const result = visibleWidth(ctx, input);
    expect(result.getWidth()).toBe(6); // 2 + 2 + 1 + 1
  });

  it('width of an empty string is 0', () => {
    const input = new AnsiText();
    input.setText('');
    const result = visibleWidth(ctx, input);
    expect(result.getWidth()).toBe(0);
  });

});
