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
        const json = JSON.stringify(this.data, null, '    ');
        fs.writeFileSync(this.configFileName, json);
    }
}

module.exports = new Config();
