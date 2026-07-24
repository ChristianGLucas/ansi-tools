import { ToHtmlRequest } from '../gen/messages_pb';
import { toHtml } from './to_html';
import { ctx, sgr, RESET } from './testkit';

describe('ToHtml', () => {
  it('wraps a colored run in a <span> with an inline style carrying the resolved color', () => {
    const input = new ToHtmlRequest();
    input.setText(`${sgr('31')}Red${RESET}`);
    const result = toHtml(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getHtml()).toContain('<span');
    expect(result.getHtml()).toContain('Red');
    expect(result.getHtml()).toContain('187, 0, 0');
  });

  it('HTML-escapes literal &, <, > in the input so it never emits injected markup', () => {
    const input = new ToHtmlRequest();
    input.setText('<script>alert(1)</script> & "quotes"');
    const result = toHtml(ctx, input);
    expect(result.getHtml()).not.toContain('<script>');
    expect(result.getHtml()).toContain('&lt;script&gt;');
    expect(result.getHtml()).toContain('&amp;');
  });

  it('emits a CSS class name instead of an inline style when use_classes is true', () => {
    const input = new ToHtmlRequest();
    input.setText(`${sgr('31')}Red${RESET}`);
    input.setUseClasses(true);
    const result = toHtml(ctx, input);
    expect(result.getHtml()).toContain('ansi-red-fg');
    expect(result.getHtml()).not.toContain('style=');
  });

  it('returns empty html for an empty string', () => {
    const input = new ToHtmlRequest();
    input.setText('');
    const result = toHtml(ctx, input);
    expect(result.getHtml()).toBe('');
  });

});
