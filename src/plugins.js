const config = require('./config');

class Plugins {
    constructor() {
        this.list = [];
    }

    async init() {
        const t = this;
        const { plugins } = config.get();

        const list = Object.keys(plugins).map((name) => async () => {
            const module = await import(`./plugins/${name}.js`);
            const PluginClass = module.default;
            t.list.push(new PluginClass(plugins[name], config.get()));
        });

        await list.reduce((p, f) => p.then(f), Promise.resolve());
        await this.action('init');
    }

    async done() {
        await this.action('done');
        this.list = [];
    }

    async action(event) {
        const conf = config.get();
        const list = this.list.map((it) => async () => {
            await it.action(event, conf);
        });
        list.reduce((p, f) => p.then(f), Promise.resolve());
    }
}

module.exports = new Plugins();
