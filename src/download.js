const fs = require('fs');
const { promisify } = require('node:util');
const { pipeline } = require('node:stream');

async function download(fileUrl, destPath) {
    // eslint-disable-next-line import/no-extraneous-dependencies, no-shadow
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

    const streamPipeline = promisify(pipeline);

    const response = await fetch(fileUrl);

    if (!response.ok) {
        throw new Error(`unexpected response ${response.statusText}`);
    }

    await streamPipeline(response.body, fs.createWriteStream(destPath));
}

module.exports = download;
