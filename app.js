const express = require('express');
const bodyParser = require("body-parser");
// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');

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

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
   console.log(`App listening on port ${PORT}`);
   console.log('Press Ctrl+C to quit.');
});

app.get('/', function(req, res) {
    //res.sendFile("product.html", { root: path.join(__dirname, '/')});
    res.sendFile(path.join(__dirname+'/search.html'));
});

app.post('/data', function(req, res) {
	var data = req.body.data1;
    //publishMessage (data);
    console.log("Data received from keypress = " + data);
    
	// Just query DS using client library
	var key = datastore.key(['Task', 1]);
	datastore.get(key, function(err, entity) {
  		// entity = The record.
  		// entity[datastore.KEY] = The key for this entity.
  		console.log("entity name = " + entity.name);
  		res.status(200).send(entity.name).end();
	});
    
});

app.get('/count', function(req, res) {
	query = datastore.createQuery(['__Stat_Total__']);
	datastore.runQuery(query, function(err, entities, endCursor) {
  		if (err) {
    		return;
  		}
  		console.log('Number of entities:', entities[0].count)
  		console.log('Total entity size:', entities[0].entity_size)
	});
});
