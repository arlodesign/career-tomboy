const concurrently = require("concurrently");
const upath = require("upath");

const browserSyncPath = upath.resolve(
    upath.dirname(__filename),
    "../node_modules/.bin/browser-sync",
);

const browserSyncCommand =
    process.platform === "win32"
        ? `"${browserSyncPath}.cmd"`
        : `"${browserSyncPath}"`;

const { result } = concurrently(
    [
        {
            command: "node scripts/sb-watch.js",
            name: "SB_WATCH",
            prefixColor: "bgBlue.bold",
        },
        {
            command: `${browserSyncCommand} --reload-delay 2000 --reload-debounce 2000 dist -w --no-online`,
            name: "SB_BROWSER_SYNC",
            prefixColor: "bgGreen.bold",
        },
    ],
    {
        prefix: "name",
        killOthers: ["failure", "success"],
    },
);

result.then(
    () => {
        console.log("Success");
        process.exit(0);
    },
    (err) => {
        console.error("Failure:", err);
        process.exit(1);
    },
);
