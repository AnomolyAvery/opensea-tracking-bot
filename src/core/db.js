const config = require('./config');
const fs = require('fs');
const path = require('path');

let cache = {};

class Db {
    constructor() {
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
        if (fs.existsSync(config.storagePath)) {
            const data = fs.readFileSync(config.storagePath);
            cache = JSON.parse(data);
        }
    }

    save() {
        const data = JSON.stringify(cache);
        fs.writeFileSync(config.storagePath, data);
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
