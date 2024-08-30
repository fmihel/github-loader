/* eslint-disable camelcase */
const fs = require('fs');
const path = require('path');
const { exit } = require('process');
const unzipper = require('unzipper');
const download = require('./src/download');
const dir = require('./src/dir');

function load_config() {
    const configFileName = './config.json';

    const configJSON = fs.readFileSync(configFileName);
    return {
        mode: 'prod',
        dest: './git',
        tmp_path: './tmp_git_path',
        getZipUrl(key, val) {
            return `https://github.com/${key}/archive/refs/${val.indexOf('tags/') === 0 ? val : (`heads/${val}`)}.zip`;
        },

        dev: {},
        prod: {},
        ...JSON.parse(configJSON),
    };
}

async function load_zip_repo(url, filePath) {
    return download(url, filePath);
}

async function unpack_zip_to(zip, toPath) {
    const directory = await unzipper.Open.file(zip);
    // console.log('directory', directory);
    await directory.extract({ path: toPath });

    // return new Promise((resolve, reject) => {
    //     directory.files[0]
    //         .stream()
    //         .pipe(fs.createWriteStream('firstFile'))
    //         .on('error', reject)
    //         .on('finish', resolve);
    // });
}

function main(params) {
    const config = load_config();

    const reps = {
        ...(config.mode === 'dev' ? config.dev : {}),
        ...config.prod,
    };

    const list = [];
    const keys = Object.keys(reps);
    keys.map((key) => {
        const url = config.getZipUrl(key, reps[key]);
        const akey = reps[key].split('/');
        const repoPath = path.join(config.dest, key);
        const name = `${akey[akey.length - 1]}.zip`;

        // console.log({
        //     key, url, akey, repoPath, name, res: path.join(repoPath, name),
        // });
        dir.del(repoPath);
        dir.create(repoPath);

        list.push(async () => {
            const zip = path.join(repoPath, name);
            await load_zip_repo(url, zip);
            await unpack_zip_to(zip, repoPath);
        });
        // load_zip_repo(url, path.join(repoPath, name));
    });

    list.reduce((p, f) => p.then(f), Promise.resolve());
    // download('https://github.com/fmihel/php-config/archive/refs/heads/main.zip', 'git\\fmihel\\php-config\\main.zip');
}

main();
