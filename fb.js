const rp = require('request-promise'),
    config = require('config');

const me = (sender, handleResponse) => {

    const opts = {
        uri: `https://graph.facebook.com/v2.11/${sender}`,
        qs: {
            fields: 'first_name, gender, locale, last_name',
            access_token: config.get('pageAccessToken')
        },
        method: 'GET'
    };

    rp(opts)
        .then((body) => {
            const data = JSON.parse(body);
            handleResponse(data, null);

        })
        .catch((error) => {
            handleResponse(null, error);
        });
};

const configuration = (handleResponse) => {
    const opts = {
        uri: `https://graph.facebook.com/v2.11/me/messenger_profile`,
        qs: {
            access_token: config.get('pageAccessToken')
        },
        method: 'POST',
        json: {
            "greeting":[
                {
                    "locale":"default",
                    "text":"Hola {{user_first_name}}! Bienvenido a BankBot, estoy para ayudarte en lo que necesites de tu Banco."
                }]
        }
    };

    rp(opts)
        .then((body) => {
            handleResponse(body, null);

        })
        .catch((error) => {
            handleResponse(null, error);
        });
};

module.exports = {
    me, configuration
};