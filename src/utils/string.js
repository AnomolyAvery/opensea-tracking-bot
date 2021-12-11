const captilizeFirstChar = (str) => {
    return str.toLowerCase().charAt(0).toUpperCase() + str.slice(1);
};

module.exports = {
    captilizeFirstChar,
};
