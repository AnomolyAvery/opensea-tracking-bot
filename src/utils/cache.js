module.exports = {
    cache: {},
    get: (key) => {
        try {
            return this.cache[key];
        } catch (e) {
            console.log(e);
        }
    },
    set: (key, val) => {
        this.cache[key] = val;
    },
};
