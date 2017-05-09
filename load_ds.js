const fs = require("fs");
// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');

// Your Google Cloud Platform project ID
const projectId = 'autocomplete-166617';
// Instantiates a Datastore client
const datastore = Datastore({
  projectId: projectId
});

// The kind for the Datastore entity
const kind = 'Task';
var task;
var taskKey = '';
//Parse the JSON
const file = 'products.json';
var i = 1;

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
        i++;
    }
});

function processRecord(record) {
    console.log('Record name = ' + record.name);
    // The Cloud Datastore key for the new entity
    taskKey = datastore.key([kind, i]);
    task = '';
    // Prepares the new entity
    task = {
      key: taskKey,
      data: {
        name: record.name
      }
    };
    // Saves the entity
    datastore.save(task).then(() => {
      //console.log(i, `Saved ${task.data.name}`);
    });
}