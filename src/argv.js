/* eslint-disable array-callback-return */
/* eslint-disable prefer-destructuring */
const config = {};

const action = {
    type: false,
    reps: [],
};

process.argv.map((param) => {
    const params = param.split('=');
    if (params.length > 1) {
        config[params[0]] = params[1];
    } else if (!action.type) {
        if (param === 'i' || param === 'install') {
            action.type = 'install';
            action.reps = [];
        }
        if (param === 'uninstall') {
            action.type = 'uninstall';
            action.reps = [];
        }
        if (param === 'update') {
            action.type = 'update';
            action.reps = [];
        }
    } else if ((param === '-S') || (param === '-P')) {
        config.mode = 'prod';
    } else if (param === '-D') {
        config.mode = 'dev';
    } else {
        action.reps.push(param);
    }
});
module.exports = {
    config,
    action,
};
