const config = require('./config');
const fs = require('fs');
const path = require('path');

let cache = {};

class Db {
    constructor(file) {
        console.log(`Loading database ${file}`);
        this.file = file;
        this.load();
    }

    get(key) {
        if (cache) {
            return cache[key] ?? null;
        }
        return null;
    }

    set(key, value) {
        cache[key] = value;
    }

    load() {
        if (fs.existsSync(this.file)) {
            const data = fs.readFileSync(this.file);
            cache = JSON.parse(data);
        }
    }

    save() {
        const data = JSON.stringify(cache);
        fs.writeFileSync(this.file, data);
    }

    clear() {
        cache = {};
    }

    getFile() {
        return this.file;
    }
}

const instance = new Db(config.storagePath);

module.exports = {
    get: instance.get,
    set: instance.set,
    load: instance.load,
    save: instance.save,
    clear: instance.clear,
    getFile: instance.getFile,
};
