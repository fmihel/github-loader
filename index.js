/* eslint-disable camelcase */
const fs = require('fs');
const path = require('path');
const { exit } = require('process');
const unzipper = require('unzipper');
const { globSync } = require('glob');
const aaa = require('aaa');
const download = require('./src/download');
const dir = require('./src/dir');

function load_config() {
    const configFileName = './config.json';

    const configJSON = fs.readFileSync(configFileName);
    return {
        mode: 'prod',
        dest: './git-repo',
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

    // console.log('directory', directory.files[0]);
    await directory.extract({ path: toPath });
    return directory.files[0].path.replace('/', '');
    // return new Promise((resolve, reject) => {
    //     directory.files[0]
    //         .stream()
    //         .pipe(fs.createWriteStream('firstFile'))
    //         .on('error', reject)
    //         .on('finish', resolve);
    // });
}

function main() {
    const config = load_config();

    const reps = {
        ...(config.mode === 'dev' ? config.dev : {}),
        ...config.prod,
    };

    if (!dir.exists(config.dest)) {
        dir.create(config.dest);
    }

    const list = [];
    const keys = Object.keys(reps);

    keys.map((key) => {
        const url = config.getZipUrl(key, reps[key]);
        const rout = key.split('/');
        const author = rout[0];
        const authorPath = path.join(config.dest, author);
        const project = rout[1];
        // const repoPath = path.join(config.dest, key);// author+project
        const akey = reps[key].split('/');
        const name = `${akey[akey.length - 1]}.zip`;

        // console.log({
        //     key, url, akey, repoPath, name, res: path.join(repoPath, name), author, project,
        // });

        if (!dir.exists(authorPath)) {
            dir.create(authorPath);
        }

        list.push(async () => {
            const zip = path.join(authorPath, name);
            await load_zip_repo(url, zip);

            const to = await unpack_zip_to(zip, authorPath);
            dir.rename(path.join(authorPath, to), path.join(authorPath, project));
            fs.unlinkSync(zip);
        });
        // load_zip_repo(url, path.join(repoPath, name));
    });

    list.reduce((p, f) => p.then(f), Promise.resolve());
}

// const list = globSync('git-repo/**/*.php');

// console.log(list);
// main();

aaa();
