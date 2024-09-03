/* eslint-disable array-callback-return */
// const path = require('path');
const fs = require('fs');
const dir = require('./dir');

class Filter {
    apply(repoName, toPath, config) {
        const { include: inc, exclude: exc } = config;

        const include = this.rules(repoName, inc);
        const exclude = this.rules(repoName, exc);

        const list = dir.files(toPath, true);

        list.map((file) => {
            if ((exclude.length && this.assept(file, exclude)) || (include.length && !this.assept(file, include))) {
                // console.log('delete', file);
                fs.unlinkSync(file);
            }
        });
        dir.delEmpty(toPath);
    }

    rules(repoName, list) {
        let out = [];

        list.map((it) => {
            if (typeof it === 'string') {
                out.push(it);
            } else {
                Object.keys(it).map((repo) => {
                    if (repo === repoName) {
                        out = [...out, ...it[repo]];
                    }
                });
            }
        });
        return out;
    }

    assept(value, templates) {
        for (let i = 0; i < templates.length; i++) {
            if (this._assept(value, templates[i])) {
                return true;
            }
        }
        return false;
    }

    _assept(value, template) {
        const regx = this.fileTemplateToRegExp(template);
        return regx.test(value);
    }

    fileTemplateToRegExp(template) {
        const re = template.replaceAll('*', '\\S*').replaceAll('.', '\\.');
        return new RegExp(re);
    }
}

module.exports = new Filter();
