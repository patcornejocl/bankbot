
const isDefined = (obj) => {
    if (typeof obj === 'undefined') {
        return false;
    }

    if (!obj) {
        return false;
    }

    return obj != null;
};

module.exports = {
    isDefined
};