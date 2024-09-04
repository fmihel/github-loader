/* eslint-disable array-callback-return */
const fs = require('fs');
const path = require('path');
const zip = require('./zip');
const download = require('./download');
const configFile = require('./config');
const filter = require('./filter');

class actions {
    static async install(config) {
        const stat = {
            all: 0,
            withError: 0,
        };
        const t = this;
        const mode = (config.dest === config.cache) ? 'dev' : config.mode;
        const reps = {
            ...(mode === 'dev' ? config.dev : {}),
            ...config.prod,
        };

        const list = [];

        Object.keys(reps).map((repoName) => {
            list.push(async () => {
                stat.all++;
                try {
                    await t._installRep(repoName, reps[repoName], config);
                    console.log(`${repoName}: ok`);
                } catch (e) {
                    console.log(`error install ${repoName}: ${e.message}`);
                    stat.withError++;
                }
            });
        });

        await list.reduce((p, f) => p.then(f), Promise.resolve());
        console.log(`install ${stat.all} repo with ${stat.withError} errors`);
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
                    try {
                        await t._installRep(repoName, head, config);
                        configFile.add({
                            ...config,
                            [mode]: {
                                ...config[mode],
                                [repoName]: head,
                            },
                        });
                        console.log(`${repoName}: ok`);
                    } catch (e) {
                        console.log(`error install ${repoName}: ${e.message}`);
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
        const t = this;
        const conf = {
            ...config,
            dest: config.cache,
        };
        const list = [];
        reps.map((repoName) => {
            const cachePath = path.resolve(path.join(conf.cache, '_cache', repoName));
            const devPath = path.resolve(path.join(conf.cache, repoName));

            if (fs.existsSync(cachePath)) {
                fs.rmSync(cachePath, { recursive: true, force: true });
            }

            if (fs.existsSync(devPath)) {
                fs.rmSync(cachePath, { recursive: true, force: true });
            }

            let head = 'main';
            if (repoName in conf.dev) head = conf.dev[repoName];
            else if (repoName in conf.prod) head = conf.prod[repoName];

            list.push(async () => {
                try {
                    await t._installRep(repoName, head, conf);
                    console.log(`update ${repoName}: ok`);
                } catch (e) {
                    console.log(`error update ${repoName}: ${e.message}`);
                }
            });
        });
        await list.reduce((p, f) => p.then(f), Promise.resolve());
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

            if (!fs.existsSync(authorPath)) {
                state = `mkdir ${authorPath}`;
                fs.mkdirSync(authorPath, { recursive: true });
            }
            if (!fs.existsSync(cachePath)) {
                state = `mkdir ${cachePath}`;
                fs.mkdirSync(cachePath, { recursive: true });
            }
            if (fs.existsSync(target)) {
                state = `del/rm ${target}`;
                fs.rmSync(target, { recursive: true, force: true });
            }

            if (!fs.existsSync(zipFileInCache)) {
                state = `download ${url} to ${zipFileInCache}`;
                await download(url, zipFileInCache);
            }

            state = `unpack ${zipFileInCache} to ${authorPath}`;
            const to = await zip.unpack(zipFileInCache, authorPath);

            state = `rename ${path.join(authorPath, to)} to ${target}`;
            fs.renameSync(path.join(authorPath, to), target);

            state = 'filter';
            filter.apply(repoName, target, config);
        } catch (e) {
            throw new Error(`${state}`);
            // console.log('---------------------------------------');
            // console.log(`install error on ${state}: ${repoName}`);
            // console.error(e);
            // console.log('---------------------------------------');
        }
        return true;
    }
}

module.exports = actions;
