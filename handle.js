const Utils = require("./utils"),
        fb = require("./fb");

const inputWelcome = (sender) => {
    fb.fbMe(senderId, (data, err) => {
        if(data) {

        } else {

        }
    })
};

module.exports = {
    inputWelcome
};