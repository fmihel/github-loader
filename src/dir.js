const fs = require('fs');

class Dir {
    create(path) {
        fs.mkdirSync(path, { recursive: true });
    }

    del(path) {
        fs.rmSync(path, { recursive: true, force: true });
    }

    rename(from, to) {
        fs.renameSync(from, to);
    }

    exists(path) {
        return fs.existsSync(path);
    }
}

module.exports = new Dir();
