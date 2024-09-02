const fs = require('fs');
const path = require('path');
const zip = require('./zip');
const download = require('./download');
const configFile = require('./config');

class gitrep {
    static async install(config) {
        const t = this;
        const mode = (config.dest === config.cache) ? 'dev' : config.mode;
        const reps = {
            ...(mode === 'dev' ? config.dev : {}),
            ...config.prod,
        };

        const list = [];

        Object.keys(reps).map((repoName) => {
            list.push(async () => t._installRep(repoName, reps[repoName], config));
        });

        await list.reduce((p, f) => p.then(f), Promise.resolve());
    }

    static async add(reps, config) {
        const t = this;
        const list = [];
        const { mode } = config;
        reps.map((rep) => {
            const names = rep.split(':');
            const repoName = names[0];
            const head = names.length > 1 ? names[1] : 'main';
            if ((repoName in config.dev) || (repoName in config.prod)) {
                console.log(`${repoName} is already install, run "uninstall ${repoName}" before`);
            } else {
                list.push(async () => {
                    if (await t._installRep(repoName, head, config)) {
                        configFile.add({
                            ...config,
                            [mode]: {
                                ...config[mode],
                                [repoName]: head,
                            },
                        });
                    }
                });
            }
        });
        await list.reduce((p, f) => p.then(f), Promise.resolve());
        configFile.save();
    }

    static async updateAll(config) {
        const conf = { ...config, dest: config.cache };
        if (fs.existsSync(conf.cache)) {
            fs.rmSync(conf.cache, { recursive: true, force: true });
        }
        await this.install(conf);
    }

    static async update(reps, config) {
        const conf = {
            ...config,
            dest: config.cache,
            mode: 'prod',
        };
        reps.map((repoName) => {
            const cachePath = path.resolve(path.join(config.cache, '_cache', repoName));
            const devPath = path.resolve(path.join(config.cache, repoName));

            if (fs.existsSync(cachePath)) {
                fs.rmSync(cachePath, { recursive: true, force: true });
            }

            if (fs.existsSync(devPath)) {
                fs.rmSync(cachePath, { recursive: true, force: true });
            }
        });

        await this.install(conf);
    }

    static async unInstall(reps, config) {
        reps.map((repoName) => {
            const cachePath = path.resolve(path.join(config.cache, '_cache', repoName));
            const devPath = path.resolve(path.join(config.cache, repoName));

            // if (fs.existsSync(cachePath)) {
            //     fs.rmSync(cachePath, { recursive: true, force: true });
            // }

            if (fs.existsSync(devPath)) {
                fs.rmSync(cachePath, { recursive: true, force: true });
            }
            const { [repoName]: drn, ...dev } = config.dev;
            const { [repoName]: prn, ...prod } = config.prod;

            configFile.add({
                ...config,
                dev,
                prod,
            });
        });

        configFile.save();
    }

    /**
     * Install pack (from cache or if not exists - from github)
     * from config{
     *   dev:{
     *      "author/project":"head"
     *   }
     * }
     *
     * @param {*} repoName  Ex: "author/project"
     * @param {*} head     Ex: "main" || "head/main" || "tag/tag-name"
     * @param {*} config
     */
    static async _installRep(repoName, head, config) {
        let state = 'init';
        try {
            // console.log(`install ${repoName} ..`);

            const url = config.getZipUrl(repoName, head);

            const repoNames = repoName.split('/');
            const author = repoNames[0];
            const project = repoNames[1];

            const authorPath = path.resolve(path.join(config.dest, author));
            const cachePath = path.resolve(path.join(config.cache, '_cache', author, project));

            const branch = head.split('/');
            const zipFileName = `${branch[branch.length - 1]}.zip`;
            const zipFileInCache = path.join(cachePath, zipFileName);
            const target = path.join(authorPath, project);

            // console.log({
            //     zipFileInCache, authorPath, target, to: path.join(authorPath),
            // });

            if (!fs.existsSync(authorPath)) {
                fs.mkdirSync(authorPath, { recursive: true });
            }
            if (!fs.existsSync(cachePath)) {
                fs.mkdirSync(cachePath, { recursive: true });
            }

            if (fs.existsSync(target)) {
                fs.rmSync(target, { recursive: true, force: true });
            }

            if (!fs.existsSync(zipFileInCache)) {
                state = 'download';
                await download(url, zipFileInCache);
            }
            state = 'unpack';
            const to = await zip.unpack(zipFileInCache, authorPath);
            fs.renameSync(path.join(authorPath, to), target);

            console.log(`install ok: ${repoName}`);

            return true;
        } catch (e) {
            console.log('---------------------------------------');
            console.log(`install error on ${state}: ${repoName}`);
            console.error(e);
            console.log('---------------------------------------');
        }
        return false;
    }
}

module.exports = gitrep;
