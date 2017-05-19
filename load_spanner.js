// Imports the Google Cloud client library
const Spanner = require('@google-cloud/spanner');
const fs = require("fs");
// Your Google Cloud Platform project ID
const projectId = 'autocomplete-166617';

// Instantiates a client
const spanner = Spanner({
  projectId: projectId
});

// Your Cloud Spanner instance ID
const instanceId = 'test-instance';

// Your Cloud Spanner database ID
const databaseId = 'example-db';

// Gets a reference to a Spanner instance and database
const instance = spanner.instance(instanceId);
const database = instance.database(databaseId);

// Instantiate Spanner table objects
const productTable = database.table('Products');

const file = 'products.json';

var lineReader = require('readline').createInterface({
    input: fs.createReadStream(file)
});

lineReader.on('line', function (line) {
    line = line.trim();

    if (line.charAt(line.length-1) === ',') {
        line = line.substr(0, line.length-1);
    }

    if (line.charAt(0) === '{') {
        processRecord(JSON.parse(line));
    }
});

function processRecord(record) {
    //console.log('Product name = ' + record.name + ' & Product ID = ' + record.sku);
    // Insert the record into the table 
    productTable.insert([
        { ProductId: record.sku, ProductName: record.name }
    ])
    .then(() => {
        console.log('Inserted ProductID = ' + record.sku);
    });
}

// Inserts rows into the Products table
// Note: Cloud Spanner interprets Node.js numbers as FLOAT64s, so
// they must be converted to strings before being inserted as INT64s

