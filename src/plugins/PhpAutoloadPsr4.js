const path = require('path');
const fs = require('fs');
const PluginClass = require('../PluginClass.js');
const dir = require('../dir');

const PSR4_OBJECT = '<%PSR4_OBJECT%>';
const PHP_AUTOLOAD_TEMPLATE = `<?php

spl_autoload_register(function ($class) {

    $psr4 = <%PSR4_OBJECT%>;

    foreach ($psr4 as $key => $path) {
        $module = false;
        $search = strpos($class, $key);

        if ($search === 0) {
            $local_class_path = substr($class, strlen($key) + 1);
            if (!$local_class_path) {
                $exp = explode('\\\\', $key);
                $local_class_path = $exp[count($exp) - 1];
            }
            $module = __DIR__ . $path . '/' . $local_class_path . '.php';
        }

        if ($module && file_exists($module)) {
            include $module;
            return;
        }
    }

});
`;

class PhpAutoloadPsr4 extends PluginClass {
    constructor(params, config) {
        super(params, config);
        this.params = {
            filename: path.resolve(path.join(config.dest, 'autoload.php')),
            ...this.params,
        };
    }

    async action(event, config) {
        if (event === 'done') {
            await this.createAutoload(config);
        }
    }

    async createAutoload(config) {
        const t = this;
        let psr4 = {};

        dir.each(config.dest, (it) => {
            if (!it.isDir && it.short === 'composer.json') {
                const json = t.loadJson(it.path);
                const autoload = t.getAutoload(json);
                if (autoload) {
                    psr4 = { ...psr4, ...t.getPsr4(autoload, config, it.path) };
                }
            }
        });

        fs.writeFileSync(
            this.params.filename,
            PHP_AUTOLOAD_TEMPLATE.replace(
                PSR4_OBJECT,
                `[${
                    Object.keys(psr4).reduce((a, b) => {
                        const val = `"${b}"=>"${psr4[b]}"`;
                        return !a ? val : `${a},\n\t\t\t${val}`;
                    }, '')}]`,
            ),
        );
    }

    loadJson(filename) {
        const configJSON = fs.readFileSync(filename);
        return JSON.parse(configJSON);
    }

    getAutoload(json) {
        return (('autoload' in json) && ('psr-4' in json.autoload)) ? json.autoload['psr-4'] : false;
    }

    getPsr4(autoload, config, composerFilePath) {
        const out = {};

        Object.keys(autoload).map((namespace) => {
            const localPath = autoload[namespace];

            out[namespace] = localPath;
        });
        return {};
    }
}

module.exports = PhpAutoloadPsr4;
