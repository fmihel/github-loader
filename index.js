/* eslint-disable camelcase */
const config = require('./src/config');
const actions = require('./src/actions');
const argv = require('./src/argv');

function main() {
    const { action } = argv;

    if (action.type === 'install') {
        if (!action.reps.length) {
            actions.install(config.get());
        } else {
            actions.add(action.reps, config.get());
        }
    } else if (action.type === 'uninstall') {
        actions.unInstall(action.reps, config.get());
    } else if (action.type === 'update') {
        if (!action.reps.length) {
            actions.updateAll(config.get());
        } else {
            actions.update(action.reps, config.get());
        }
    } else {
        console.log('git rep loader v0.0.1');
    }
}

main();
