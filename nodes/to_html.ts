import Anser from 'anser';
import { ToHtmlRequest, HtmlResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';

/**
 * Converts ANSI-colored text to HTML, wrapping each styled run in a <span>
 * (inline styles by default, or CSS classes like "ansi-red-fg" when
 * use_classes is true) with plain text HTML-escaped first (so any literal
 * "&", "<", ">", or '"' in the input renders as text, not markup). Only SGR
 * color/style is rendered; cursor-movement and other non-SGR sequences are
 * silently dropped, as they have no HTML representation.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function toHtml(ax: AxiomContext, input: ToHtmlRequest): HtmlResult {
  const result = new HtmlResult();
  const text = input.getText() ?? '';

  const escaped = Anser.escapeForHtml(text);
  const html = Anser.ansiToHtml(escaped, { use_classes: input.getUseClasses() ?? false });
  result.setHtml(html);
  return result;
}
