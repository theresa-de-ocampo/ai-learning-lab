import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

import graphs from "./src/index.js";

const isImageMode = process.env.DIAGRAM_MODE === "images";
const outputFolder = isImageMode ? "images" : "mermaid-code";
const outputDir = fileURLToPath(
  new URL(`./docs/${outputFolder}/`, import.meta.url)
);
await fs.mkdir(outputDir, { recursive: true });

if (isImageMode) {
  // drawMermaidPng() uses Mermaid.ink, so rendering requires internet access.
  // Render one image at a time to avoid concurrent requests to Mermaid.ink.
  for (const [name, graph] of Object.entries(graphs)) {
    const drawableGraph = await graph.getGraphAsync();
    const image = await drawableGraph.drawMermaidPng({
      backgroundColor: "white"
    });
    const imageBuffer = new Uint8Array(await image.arrayBuffer());
    const outputPath = path.join(outputDir, `${name}.png`);

    await fs.writeFile(outputPath, imageBuffer);
    console.log(`Saved ${outputPath}`);

    await sleep(2_000);
  }
} else {
  // drawMermaid() returns Mermaid syntax locally; no rendering service needed.
  await Promise.all(
    Object.entries(graphs).map(async ([name, graph]) => {
      const drawableGraph = await graph.getGraphAsync();
      const mermaidCode = drawableGraph.drawMermaid();
      const outputPath = path.join(outputDir, `${name}.mmd`);

      await fs.writeFile(outputPath, mermaidCode, "utf8");
      console.log(`Saved ${outputPath}`);
    })
  );
}
