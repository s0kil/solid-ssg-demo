import { awaitSuspense } from "solid-js";
import { renderToString, generateHydrationScript } from "solid-js/web";
import { extractCss } from "solid-styled-components";

import App from "./src/components/App";

const lang = "en";

// entry point for server render
export default async (req) => {
  const string = await renderToString(
    awaitSuspense(() => <App url={req.url} />)
  );
  const style = extractCss();
  return `<!DOCTYPE>
  <html lang="${lang}">
    <head>
      <title>Solid SSG</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="/styles.css" />
      <script>${generateHydrationScript()}</script>
      ${style ? `<style id="_goober">${style}</style>` : ""}
      <link rel="modulepreload" href="/js/index.js">
    </head>
    <body><div id="app">${string}</div></body>
    <script type="module" src="/js/index.js"></script>
  </html>`;
};
