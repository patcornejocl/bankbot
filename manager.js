const AWS = require('aws-sdk');
const Utils = require('./utils');
let db;

const getClient = () => {

    if(!Utils.isDefined(db)) {

        AWS.config.update({
            region: 'us-east-1',
            accessKeyId: '',
            secretAccessKey: '',
        });

        db = new AWS.DynamoDB.DocumentClient();
    }

    return db;
};

module.exports = {
    getClient
};