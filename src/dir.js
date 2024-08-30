const fs = require('fs');

class Dir {
    create(path) {
        fs.mkdirSync(path, { recursive: true });
    }

    del(path) {
        fs.rmSync(path, { recursive: true, force: true });
    }
}
module.exports = new Dir();
