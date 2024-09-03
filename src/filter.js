const path = require('path');
const fs = require('fs');

class Filter {
    apply(repoName, toPath, config) {
        const { include: inc, exclude: exc } = config;

        const include = inc.filter((t) => t.indexOf(':') === -1 || t.indexOf(`${repoName}:`) > -1).map((t) => t.replaceAll(`${repoName}:`, ''));
        const exclude = exc.filter((t) => t.indexOf(':') === -1 || t.indexOf(`${repoName}:`) > -1).map((t) => t.replaceAll(`${repoName}:`, ''));
        const list = this.files(toPath);

        list.map((file) => {
            if ((exclude.length && this.assept(file, exclude)) || (include.length && !this.assept(file, include))) {
                console.log('delete', file);
                fs.unlinkSync(file);
            }
        });
    }

    assept(value, templates, repoName) {
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

    files(dir) {
        const t = this;
        let out = [];
        fs.readdirSync(dir).forEach((file) => {
            const fullpath = path.join(dir, file);
            const stat = fs.statSync(fullpath);
            if (stat.isDirectory()) {
                out = [...out, ...t.files(fullpath)];
            } else {
                out.push(fullpath);
            }
        });
        return out;
    }
}

module.exports = new Filter();
