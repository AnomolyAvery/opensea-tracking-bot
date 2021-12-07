//Fast file json parer
const fs = require('fs');
const path = require('path');

class Db {
    cache = {};

    constructor(file) {
        console.log(`Loading database ${file}`);
        this.file = file;
        this.load();
    }

    get(key) {
        return this.cache[key] || null;
    }

    set(key, value) {
        this.cache[key] = value;
    }

    load() {
        if (fs.existsSync(this.file)) {
            const data = fs.readFileSync(this.file);
            this.cache = JSON.parse(data);
        }
    }

    save() {
        const data = JSON.stringify(this.cache);
        fs.writeFileSync(this.file, data);
    }

    clear() {
        this.cache = {};
    }

    getFile() {
        return this.file;
    }
}

module.exports = Db;
