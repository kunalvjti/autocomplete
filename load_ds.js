const fs = require("fs");

// Instantiates a Datastore client
var datastore = require('@google-cloud/datastore')({
  projectId: 'gstore-autocomplete',
  //keyFilename: '/Users/kunalpariani/Downloads/gstore-autocomplete-d57bf3c5d333.json'
});

// The kind for the Datastore entity
const kind = 'Products51646';
var task = [];
var taskKey = [];
//Parse the JSON

const file = 'products.json';
var i = 0;

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
        //i++;
        if (i == 500) {
            // Saves the entity
            execute_ds_upsert();
            i = 0;
        }
    }
});

function processRecord(record) {
    //console.log('Record name = ' + record.name);
    // The Cloud Datastore key for the new entity
    console.log('Record sku = ' + record.sku);
    taskKey[i] = datastore.key([kind, record.sku]);
    // Prepares the new entity
    task[i] = {
      key: taskKey[i],
      data: {
        name: record.name
      }
    };
    i++;
}

function execute_ds_upsert() {
    //console.log("Task = " + JSON.stringify(task));
    datastore.upsert(task)
      .then(() => {
        //console.log("Products inserted successfully.");
      })
      .catch((err) => {
        console.error('ERROR:', err);
      });
}