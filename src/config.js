const fs = require('fs');
const path = require('path');
const argv = require('./argv');

const defalt = {

    mode: 'prod', // dev | prod
    dest: '', // path to install, if empty(dest) => dest = cache
    cache: './gitrep',

    getZipUrl(key, val) {
        return `https://github.com/${key}/archive/refs/${val.indexOf('tags/') === 0 ? val : (`heads/${val}`)}.zip`;
    },

    dev: {},
    prod: {},
    // ...JSON.parse(configJSON),
    exclude: [],
    include: [],
};

class Config {
    constructor() {
        // this.configFileName = path.join(__dirname, '/../config.json');
        this.configFileName = path.join(process.cwd(), 'gitrep.json');
        this.data = {
            ...defalt,
            ...this.load(),
            ...argv.config,
        };

        this.data.dest = this.data.dest || this.data.cache;
    }

    get(addData = {}) {
        return {
            ...this.data,
            ...addData,
        };
    }

    add(data) {
        this.data = {
            ...this.data,
            ...data,
        };
        return this.data;
    }

    load() {
        const configJSON = fs.readFileSync(this.configFileName);
        return JSON.parse(configJSON);
    }

    save() {
        /** сохраняем только те поля , что есть в самом конфиге gitrep.json
         * если нет dev или prod тоже добавляем их
        */
        const config = this.load();
        const keys = Object.keys(config);
        if (!('dev' in config) && this.data.dev && Object.keys(this.data.dev).length) {
            keys.push('dev');
        }
        if (!('prod' in config) && this.data.prod && Object.keys(this.data.prod).length) {
            keys.push('prod');
        }

        keys.map((key) => {
            config[key] = this.data[key];
        });

        const json = JSON.stringify(config, null, '    ');
        fs.writeFileSync(this.configFileName, json);
    }
}

module.exports = new Config();
