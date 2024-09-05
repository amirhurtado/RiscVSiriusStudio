const { build } = require("esbuild");
const { copy } = require("esbuild-plugin-copy");
const { clean } = require("esbuild-plugin-clean");

//@ts-check
/** @typedef {import('esbuild').BuildOptions} BuildOptions **/

/** @type BuildOptions */
const baseConfig = {
  bundle: true,
  minify: process.env.NODE_ENV === "production",
  sourcemap: process.env.NODE_ENV !== "production",
};

// Config for extension source code (to be run in a Node-based context)
/** @type BuildOptions */
const extensionConfig = {
  ...baseConfig,
  platform: "node",
  mainFields: ["module", "main"],
  format: "cjs",
  entryPoints: ["./src/extension.ts"],
  outfile: "./out/extension.js",
  // watch: true,
  plugins: [
    copy({
      resolveFrom: "cwd",
      // dryRun: true,
      // verbose:true,
      assets: [
        {
          from: ["./src/simulatorview/styles.css", "./src/simulatorview/cpu0Events.js"],
          to: ["./out"],
        },
        {
          from: "./media/RobotoMono.ttf",
          to: "./out",
        },
        {
          from: "./media/tabulator.min.css",
          to: "./out",
        },
        {
          from: "./src/panels/panels.css",
          to: "./out",
        },
        {
          from: "./src/documentation/index.md",
          to: "./out/",
        },
        // watch: true
      ],
    }),
    clean({ patterns: ["./out/*"], verbose: true }),
  ],
  external: ["vscode"],
};

// Config for webview source code (to be run in a web-based context)
/** @type BuildOptions */
const simulatorviewConfig = {
  ...baseConfig,
  target: "es2020",
  format: "esm",
  entryPoints: ["./src/simulatorview/main.ts"],
  outfile: "./out/simulatorview.js",
};

const registersviewConfig = {
  ...baseConfig,
  target: "es2020",
  format: "esm",
  entryPoints: ["./src/registersview/registersview.ts"],
  outfile: "./out/registersview.js",
  plugins: [
    copy({
      resolveFrom: "cwd",
      assets: [
        {
          from: "./media/binary-svgrepo-com.svg",
          to: "./out",
        },
      ],
      // watch: true
    }),
  ],
};

const progmemviewConfig = {
  ...baseConfig,
  target: "es2020",
  format: "esm",
  entryPoints: ["./src/progmemview/progmemview.ts"],
  outfile: "./out/progmemview.js",
};

const datamemviewConfig = {
  ...baseConfig,
  target: "es2020",
  format: "esm",
  entryPoints: ["./src/datamemview/datamemview.ts"],
  outfile: "./out/datamemview.js",
};

const instructionviewConfig = {
  ...baseConfig,
  target: "es2020",
  format: "esm",
  entryPoints: ["./src/instructionview/instructionview.ts"],
  outfile: "./out/instructionview.js",
};

const documentationviewConfig = {
  ...baseConfig,
  target: "es2020",
  format: "esm",
  entryPoints: ["./src/documentationview/documentationview.ts"],
  outfile: "./out/documentationview.js",
};

// This watch config adheres to the conventions of the esbuild-problem-matchers
// extension (https://github.com/connor4312/esbuild-problem-matchers#esbuild-via-js)
/** @type BuildOptions */
const watchConfig = {
  watch: {
    onRebuild(error, result) {
      console.log("[watch] build started");
      if (error) {
        error.errors.forEach((error) =>
          console.error(
            `> ${error.location.file}:${error.location.line}:${error.location.column}: error: ${error.text}`
          )
        );
      } else {
        console.log("[watch] build finished");
      }
    },
  },
};

// Build script
(async () => {
  const args = process.argv.slice(2);
  try {
    if (args.includes("--watch")) {
      // Build and watch extension and webview code
      console.log("[watch] build started");
      await build({
        ...extensionConfig,
        ...watchConfig,
      });
      await build({
        ...simulatorviewConfig,
        ...watchConfig,
      });
      await build({
        ...registersviewConfig,
        ...watchConfig,
      });
      await build({
        ...progmemviewConfig,
        ...watchConfig,
      });
      await build({
        ...datamemviewConfig,
        ...watchConfig,
      });
      await build({
        ...instructionviewConfig,
        ...watchConfig,
      });
      await build({
        ...documentationviewConfig,
        ...watchConfig,
      });
      console.log("[watch] build finished");
    } else {
      // Build extension and webview code
      await build(extensionConfig);
      await build(simulatorviewConfig);
      await build(registersviewConfig);
      await build(progmemviewConfig);
      await build(datamemviewConfig);
      await build(instructionviewConfig);
      await build(documentationviewConfig);
      console.log("build complete");
    }
  } catch (err) {
    process.stderr.write(err.stderr);
    process.exit(1);
  }
})();
