let cache = {};

// Return the cached value for the given key, or null if not found.
const get = (key) => {
    return cache[key] ?? null;
};

const set = (key, value) => {
    cache[key] = value;

    return value;
};

const clear = () => {
    cache = {};
};

module.exports = {
    get,
    set,
    clear,
};
