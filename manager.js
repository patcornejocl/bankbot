const AWS = require('aws-sdk');
const Utils = require('./utils');
let db;

const getClient = () => {

    if(!Utils.isDefined(db)) {

        AWS.config.update({
            region: 'us-east-1',
            accessKeyId: 'AKIAIVIEPZFZNRFCB3BQ',
            secretAccessKey: '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',
        });

        db = new AWS.DynamoDB.DocumentClient();
    }

    return db;
};

module.exports = {
    getClient
};