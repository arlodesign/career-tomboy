import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import favicons from "favicons";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcIcon = path.join(root, "src", "assets", "favicon.svg");
const outDir = path.join(root, "public");

const config = {
    path: "/",
    appName: "Career Tomboy",
    appShortName: "Career Tomboy",
    appDescription: "Chicago's favorite 90s/2000s alternative cover band",
    // Colors taken from src/styles/global.css:
    // --color-ct-white: #fef1db;
    // --color-ct-lime: #9fd96f;
    background: "#fef1db",
    theme_color: "#9fd96f",
    icons: {
        android: true,
        appleIcon: true,
        appleStartup: false,
        favicons: true,
        windows: true,
        yandex: false,
    },
};

async function main() {
    try {
        await fs.access(srcIcon);
    } catch {
        console.warn("[favicons] No src/assets/favicon.svg found; skipping.");
        return;
    }

    const response = await favicons(srcIcon, config);

    await fs.mkdir(outDir, { recursive: true });

    for (const asset of [...response.images, ...response.files]) {
        await fs.writeFile(path.join(outDir, asset.name), asset.contents);
    }

    // Also expose the original SVG as /favicon.svg for modern browsers
    await fs.copyFile(srcIcon, path.join(outDir, "favicon.svg"));
}

main().catch((err) => {
    console.error("[favicons] generation failed:", err);
    process.exit(1);
});
