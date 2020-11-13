const fs = require("fs");
const path = require("path");
const renderStatic = require("solid-ssr/static");
const minifyHtml = require("@minify-html/js");

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

// Create Directories
Object.values(STATIC_ROUTES).forEach((staticFilePath) => {
  const dir = path.parse(staticFilePath).dir;
  fs.mkdirSync(dir, { recursive: true });
});

renderStatic(
  PAGES.map((page) => ({
    entry: pathToServer,
    output: STATIC_ROUTES[page],
    url: `/${page}`,
  }))
);

// Minify HTML Files
// https://github.com/ryansolid/solid/pull/260
setTimeout(() => {
  Object.values(STATIC_ROUTES).forEach((staticFilePath) => {
    const config = minifyHtml.createConfiguration({ minifyJs: true });
    const minified = minifyHtml.minifyInPlace(
      fs.readFileSync(staticFilePath),
      config
    );
    // console.log("Minified: ", staticFilePath);
    fs.writeFileSync(staticFilePath, minified);
  });
}, 2000);
