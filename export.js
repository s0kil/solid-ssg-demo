const fs = require("fs");
const path = require("path");
const renderStatic = require("solid-ssr/static");
const minifyHtml = require("@minify-html/js");

const log = (message) => console.log(`> ${message}`);

(async function main() {
  const PAGES = ["index", "profile", "settings"];
  const pathToServer = path.resolve(__dirname, "lib/index.js");
  const pathToPublic = path.resolve(__dirname, "public");

  const STATIC_ROUTES = PAGES.reduce((routes, page) => {
    if (page == "index") {
      routes[page] = path.join(pathToPublic, "index.html");
    } else {
      routes[page] = path.join(pathToPublic, page, "index.html");
    }
    return routes;
  }, {});

  log("Create Directories");
  await Promise.all(
    Object.values(STATIC_ROUTES).map((staticFilePath) => {
      const dir = path.parse(staticFilePath).dir;
      return fs.promises.mkdir(dir, { recursive: true });
    })
  );

  log("Render Pages");
  await renderStatic(
    PAGES.map((page) => ({
      entry: pathToServer,
      output: STATIC_ROUTES[page],
      url: `/${page}`,
    }))
  );

  log("Minify HTML Files");
  const htmlMinifierConfig = minifyHtml.createConfiguration({ minifyJs: true });
  await Promise.all(
    Object.values(STATIC_ROUTES).map((staticFilePath) => {
      const minified = minifyHtml.minifyInPlace(
        fs.readFileSync(staticFilePath),
        htmlMinifierConfig
      );
      return fs.promises.writeFile(staticFilePath, minified);
    })
  );
})();
