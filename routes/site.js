const Utils = require("../utils"),
    fb = require("../fb"),
    api = require("../api"),
    gh = require("ngeohash");

const index = (req, res) => {
    res.render('home.twig')
};

const config = (req, res) => {
    fb.configuration((err, data) => {
        if(data) {
            res.json(data);
        } else {
            res.json(err);
        }
    });
};

const webhook = (req, res) => {
    const body = req.body;
    const payload = body["originalDetectIntentRequest"]["payload"];

    if (Utils.isDefined(payload)) {
        const data = payload["data"];
        const source = payload["source"];

        if(Utils.isDefined(data) && source === "facebook") {
            const result = body["queryResult"];

            if(Utils.isDefined(result)) {
                const action = result["action"];

                if(Utils.isDefined(action)) {
                    const accountType = result["parameters"]["account-type"];
                    const senderId = data["sender"]["id"];

                    switch (action) {
                        case "input.welcome":

                            if(Utils.isDefined(senderId)) {
                                fb.me(senderId, (data, err) => {
                                    if(data["first_name"]) {
                                        res.json({
                                            fulfillmentMessages: [
                                                {
                                                    text: {
                                                        text: [
                                                            `Hola ${data["first_name"]}!`,
                                                            "Soy BankBot, estoy aquí para ayudarte en lo que necesites"
                                                        ]
                                                    }
                                                },
                                                {
                                                    quickReplies: {
                                                        title: "¿Qué deseas hacer?",
                                                        quickReplies: [
                                                            "Abrir Cuenta", "Bloqueo de Tarjeta", "Sucursales"
                                                        ]
                                                    }
                                                }

                                            ]
                                        })
                                    } else {
                                        res.json({
                                            fulfillmentText: `Hola! \nSoy BankBot, dime como te puedo ayudar hoy día!`
                                        })
                                    }
                                })
                            } else {
                                console.log("snedeRId not defined")
                            }
                            break;
                        case "input.open.account":

                            if(Utils.isDefined(accountType)) {
                                switch(accountType[0]) {
                                    case "cuenta corriente":
                                        res.json({
                                            fulfillmentMessages: [
                                                {
                                                    text: {
                                                        text: [
                                                            "El Plan Cuenta Corriente consta de una serie de Productos " +
                                                            "que buscan brindarte apoyo integral en todos los momentos donde puedas " +
                                                            "necesitar la ayuda de BancoEstado."
                                                        ]
                                                    }
                                                },
                                                {
                                                    quickReplies: {
                                                        title: `¿Deseas abrir una ${accountType[0]}?`,
                                                        quickReplies: [
                                                            "Si, Abrir Cuenta", "No, No quiero"
                                                        ]
                                                    }
                                                }
                                            ]
                                        });
                                        break;
                                }
                            }

                            break;
                        case "input.form.completed":
                            const userStatus = result["parameters"]["user-status"];

                            if(Utils.isDefined(accountType) && Utils.isDefined(userStatus) && Utils.isDefined(senderId)) {
                                fb.me(senderId, (data, err) => {
                                    if(data) {
                                        const item = {
                                            "sender-id": senderId,
                                            "account-type": accountType,
                                            "profile": {
                                                "first_name": data["first_name"],
                                                "last_name": data["last_name"],
                                                "locale": data["locale"],
                                                "gender": data["gender"],
                                                "status": userStatus
                                            }
                                        };

                                        api.putAccount(item, (err, data) => {
                                            if(data) {
                                                res.json({
                                                    fulfillmentText: "Tus datos han sido enviado a un representante " +
                                                    "de cuentas. Tan pronto podamos te contactaremos!"
                                                })
                                            } else {

                                                res.json({
                                                    fulfillmentMessages: [
                                                        {
                                                            text: {
                                                                text: [
                                                                    "No he podido guardar tus datos :("
                                                                ]
                                                            }
                                                        },
                                                        {
                                                            payload: {
                                                                facebook: {
                                                                    attachment:{
                                                                        type:"template",
                                                                        payload: {
                                                                            template_type :"button",
                                                                            text: "¿Deseas llamar a un representante?",
                                                                            buttons:[
                                                                                {
                                                                                    "type":"phone_number",
                                                                                    "title":"Llamar Ahora",
                                                                                    "payload":"+50763031362"
                                                                                }
                                                                            ]
                                                                        }
                                                                    }
                                                                }
                                                            }

                                                        }
                                                    ]
                                                })
                                            }
                                        });
                                    }
                                });
                            }

                            break;
                        case "input.branches":
                            const long  = result["parameters"]["long"];
                            const lat   = result["parameters"]["lat"];

                            if(Utils.isDefined(long) && Utils.isDefined(lat)) {
                                api.getBranches(gh.encode(lat, long, 4), (err, items) => {
                                    if(items) {
                                        let elements = [];
                                        let i = 0;

                                        for (const item of items) {
                                            elements.push({
                                                title: item["name"],
                                                image_url: "https://s3.amazonaws.com/bankbot/servi_img.jpg",
                                                subtitle: item["address"],
                                                default_action: {
                                                    type: "web_url",
                                                    url: `http://maps.google.com/maps?q=loc:${item["position"]}`,
                                                    webview_height_ratio: "tall",
                                                },
                                                buttons: [
                                                    {
                                                        type: "element_share"
                                                    }
                                                ]
                                            });

                                            if (i === 5) {
                                                break;
                                            }
                                            i++;
                                        }

                                        const response = {};
                                        response.fulfillmentMessages = [
                                            {
                                                text: {
                                                    text: [
                                                        `He encontrado ${elements.length} sucursales cerca de ti.`
                                                    ]
                                                }
                                            },
                                            {
                                                payload: {
                                                    facebook: {
                                                        attachment: {
                                                            type: "template",
                                                            payload: {
                                                                template_type: "generic",
                                                                elements: elements
                                                            }
                                                        }
                                                    }
                                                }

                                            }
                                        ];

                                        res.json(response);

                                    }
                                });
                            }

                            break;
                    }
                } else {
                    console.log("action not defined");
                }
            } else {
                console.log("result not defined");
            }
        } else {
            console.log("source not defined");
        }
    } else {
        console.log("data not defined");
    }
};

module.exports = {
    index, config, webhook
};