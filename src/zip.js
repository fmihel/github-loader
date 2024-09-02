const unzipper = require('unzipper');

class Zip {
    /** unpack and return target path */
    async unpack(zipFileName, toDirectory) {
        const directory = await unzipper.Open.file(zipFileName);
        await directory.extract({ path: toDirectory });
        return directory.files[0].path.replace('/', '');
    }
}

module.exports = new Zip();
