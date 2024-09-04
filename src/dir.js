const fs = require('fs');
const path = require('path');

class Dir {
    files(dir, recursive = false) {
        const t = this;
        let out = [];

        fs.readdirSync(dir).forEach((file) => {
            const fullpath = path.join(dir, file);
            const stat = fs.statSync(fullpath);
            if (stat.isDirectory()) {
                if (recursive) {
                    out = [...out, ...t.files(fullpath, true)];
                }
            } else {
                out.push(fullpath);
            }
        });
        return out;
    }

    dirs(root, recursive = false) {
        const t = this;
        let out = [];

        fs.readdirSync(root).forEach((file) => {
            const fullpath = path.join(root, file);
            const stat = fs.statSync(fullpath);
            if (stat.isDirectory()) {
                out.push(fullpath);
                if (recursive) {
                    out = [...out, ...t.dirs(fullpath, true)];
                }
            }
        });
        return out;
    }

    delEmpty(root) {
        const t = this;
        const files = t.files(root);
        const dirs = t.dirs(root).filter((sub) => !t.delEmpty(sub));

        if (dirs.length === 0 && files.length === 0) {
            fs.rmSync(root, { force: true, recursive: true });
            return true;
        }
        return false;
    }

    each(root, callback) {
        const t = this;

        fs.readdirSync(root).forEach((file) => {
            const fullpath = path.join(root, file);
            const stat = fs.statSync(fullpath);
            if (stat.isDirectory()) {
                callback({ path: fullpath, isDir: true, short: file });
                t.each(fullpath, callback);
            } else {
                callback({ path: fullpath, isDir: false, short: file });
            }
        });
    }
}

module.exports = new Dir();
