import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
const layers = ["shared", "entities", "features", "widgets", "pages", "app"];
const walk = (path) =>
  readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(join(path, entry.name))
      : [join(path, entry.name)],
  );
const failures = [];
for (const file of walk("src").filter((p) => /\.tsx?$/.test(p))) {
  const source = relative("src", file).split("/");
  for (const match of readFileSync(file, "utf8").matchAll(
    /(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g,
  )) {
    const imported = match[1];
    if (!imported.startsWith("@/") && !imported.startsWith(".")) continue;
    const destination = (
      imported.startsWith("@/")
        ? imported.slice(2)
        : relative(resolve("src"), resolve(dirname(file), imported))
    ).split("/");
    if (!layers.includes(destination[0])) continue;
    if (layers.indexOf(destination[0]) > layers.indexOf(source[0]))
      failures.push(`${file}: upward import ${imported}`);
    if (
      source[0] === destination[0] &&
      !["app", "shared"].includes(source[0]) &&
      source[1] !== destination[1]
    )
      failures.push(`${file}: cross-slice import ${imported}`);
    if (
      (source[0] !== destination[0] || source[1] !== destination[1]) &&
      destination[0] !== "app" &&
      destination.length > 2
    )
      failures.push(`${file}: bypasses public API ${imported}`);
  }
}
if (failures.length) {
  process.stderr.write(failures.join("\n") + "\n");
  process.exitCode = 1;
} else process.stdout.write("FSD layer and public API boundaries pass.\n");
