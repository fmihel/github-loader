/* eslint-disable camelcase */
const config = require('./src/config');
const actions = require('./src/actions');
const argv = require('./src/argv');
const plugins = require('./src/plugins');

async function main() {
    const { action } = argv;
    await plugins.init();

    if (action.type === 'install') {
        if (!action.reps.length) {
            await actions.install(config.get());
        } else {
            await actions.add(action.reps, config.get());
        }
    } else if (action.type === 'uninstall') {
        await actions.unInstall(action.reps, config.get());
    } else if (action.type === 'update') {
        if (!action.reps.length) {
            await actions.updateAll(config.get());
        } else {
            await actions.update(action.reps, config.get());
        }
    } else {
        console.log('gitrep v0.0.5');
    }

    await plugins.done();
}

main();
