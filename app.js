const express = require('express');
const bodyParser = require("body-parser");
// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');
const jsonfile = require('jsonfile');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());

const path = require('path');

// Your Google Cloud Platform project ID
const projectId = 'autocomplete-166617';
// Instantiates a Datastore client
const datastore = Datastore({
	projectId: projectId
});

// Imports the Google Cloud client library
const PubSub = require('@google-cloud/pubsub');

// Instantiates a client
const pubsubClient = PubSub({
  	projectId: projectId
});

// References an existing topic created in Pub/Sub, e.g. "autocomplete"
const topic = pubsubClient.topic('autocomplete');

// The kind for the Datastore entity
const kind = 'Task';
var task;
var taskKey = '';
//Parse the JSON
const file = 'products.json';

app.get('/', function(req, res) {
    //res.sendFile("product.html", { root: path.join(__dirname, '/')});
    res.sendFile(path.join(__dirname+'/product.html'));
});

app.post('/data', function(req, res) {
	var data = req.body.data1;
    publishMessage (data);
    console.log("Data received from keypress = " + data);
	function publishMessage (data) {
		// Publishes the message, e.g. "Hello, world!" or { amount: 599.00, status: 'pending' }
		return topic.publish(data)
  		  .then((results) => {
    	    const messageIds = results[0];

    	  	console.log(`Message ${messageIds[0]} published.`);

    	  	return messageIds;
  		  });
	}
});

app.get('/load', (req, res) => {   	
    jsonfile.readFile(file, function(err, obj) {
  		for (var i=0; i<obj.length; i++) {
  			//console.dir(obj)
  			// The Cloud Datastore key for the new entity
  			taskKey = datastore.key([kind, i+1]);
    		task = '';
  			// Prepares the new entity
  			task = {
  				key: taskKey,
  				data: {
    				name: obj[i].name
  				}
  			};
  			// Saves the entity
  			datastore.save(task).then(() => {
    			console.log(i, `Saved ${task.data.name}`);
  	  		});
  		}
  		console.log('Data exported to DS successfully')
	})

	res.status(200).send('Export to DS started!!').end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
   console.log(`App listening on port ${PORT}`);
   console.log('Press Ctrl+C to quit.');
});
