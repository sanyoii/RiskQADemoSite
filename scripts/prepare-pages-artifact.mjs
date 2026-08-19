import { access, cp, mkdir, readdir, rm } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function collectHtml(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtml(path));
    else if (entry.isFile() && extname(entry.name) === ".html") files.push(path);
  }
  return files;
}

const sourceArgument = argumentValue("--source");
const outputArgument = argumentValue("--output");
if (!sourceArgument || !outputArgument) {
  console.error("Usage: node scripts/prepare-pages-artifact.mjs --source <directory> --output <directory>");
  process.exit(2);
}

const source = resolve(sourceArgument);
const output = resolve(outputArgument);

try {
  await rm(output, { recursive: true, force: true });
  await mkdir(dirname(output), { recursive: true });
  await cp(source, output, { recursive: true });

  const prefixedAssets = join(output, "test-status");
  if (await exists(prefixedAssets)) {
    await cp(prefixedAssets, output, { recursive: true, force: true });
    await rm(prefixedAssets, { recursive: true, force: true });
  }

  const htmlFiles = await collectHtml(output);
  for (const htmlPath of htmlFiles) {
    const fileName = basename(htmlPath);
    if (fileName === "index.html" || fileName === "404.html") continue;
    const routeDirectory = join(dirname(htmlPath), basename(fileName, ".html"));
    await mkdir(routeDirectory, { recursive: true });
    await cp(htmlPath, join(routeDirectory, "index.html"), { force: true });
    await rm(htmlPath);
  }

  console.log(`PREPARED\t${output}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
