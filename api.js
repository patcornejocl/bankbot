const manager = require('./manager'),
    utils = require('./utils');

const putAccount = (item, handleResponse) => {

    let params = {};
    params.TableName = 'Accounts';
    params.Item = item;

    manager.getClient().put(params, handleResponse);
};

const getBranches = (code, handleResponse) => {
    let allData = [];
    console.log(code);

    let params = {};
    params.TableName = 'ATMs';
    params.FilterExpression = "begins_with(#gh, :gh)";
    params.ExpressionAttributeNames = {
        "#gh": "geohash",
    };
    params.ExpressionAttributeValues = {
        ":gh": code
    };

    const handleScanResponse = (err, data) => {

        if(utils.isDefined(err)) {
            return handleResponse(err, null);
        }

        if(data.Items.length > 0) {
            data.Items.forEach((item) => {
                allData.push(item);
            });
        }

        if (typeof data.LastEvaluatedKey !== "undefined") {
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            manager.getClient().scan(params, handleScanResponse);
        } else {
            handleResponse(null, allData);
        }
    };

    manager.getClient().scan(params, handleScanResponse);
};

module.exports = {
    putAccount, getBranches
};