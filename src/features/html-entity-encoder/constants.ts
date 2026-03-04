import { HtmlEntityOptions } from './types';

export const DEFAULT_OPTIONS: HtmlEntityOptions = {
  input: '',
  mode: 'encode',
};

export const SAMPLE_HTML = `<div class="container">
  <h1>Hello & Welcome!</h1>
  <p>This is a "sample" HTML snippet with <special> characters.</p>
  <p>Symbols: © ® ™ € £ ¥ — – … ñ ü ö</p>
  <a href="https://example.com?foo=1&bar=2">Link with query params</a>
  <script>if (x < 10 && y > 5) { alert('done'); }</script>
</div>`;
