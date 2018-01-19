const fb = require("./fb");

const inputWelcome = (sender, res) => {
    fb.fbMe(sender, (data, err) => {
        if(data) {
            console.log(data);
            res.json({
                fulfillmentText: "Soy una super respuesta!"
            });
        } else {
            console.log(err);
        }
    });

};

module.exports = {
    inputWelcome
};