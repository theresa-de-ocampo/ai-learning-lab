import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import graphs from "./src/index.js";

const outputDir = fileURLToPath(new URL("./docs/", import.meta.url));
await fs.mkdir(outputDir, { recursive: true });

// drawMermaidPng() uses Mermaid.ink, so rendering requires internet access.
await Promise.all(
  Object.entries(graphs).map(async ([name, graph]) => {
    const drawableGraph = await graph.getGraphAsync();
    const image = await drawableGraph.drawMermaidPng({
      backgroundColor: "white"
    });
    const imageBuffer = new Uint8Array(await image.arrayBuffer());
    const outputPath = path.join(outputDir, `${name}.png`);

    await fs.writeFile(outputPath, imageBuffer);
    console.log(`Saved ${outputPath}`);
  })
);
