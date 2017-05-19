const express = require('express');
const bodyParser = require("body-parser");
const app = express();

const expressLogging = require('express-logging');
const logger = require('logops');
 
const path = require('path');
const memjs = require('memjs');

// Imports the Google Cloud client library
const Spanner = require('@google-cloud/spanner');
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

app.use(expressLogging(logger));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());

app.enable('trust proxy');

// Environment variables are defined in app.yaml.
let MEMCACHE_URL = process.env.MEMCACHE_URL || '127.0.0.1:11211';

const mc = memjs.Client.create(MEMCACHE_URL);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
   console.log(`App listening on port ${PORT}`);
   console.log('Press Ctrl+C to quit.');
});

app.get('/', function(req, res) {   
    res.sendFile(path.join(__dirname+'/search.html'));
});

app.post('/data', function(req, res) {
	  var data = req.body.term;
    console.log("Data received from keypress = " + data);

    // Check in Memcache if this key exists
    mc.get(data, (err, value) => {
      if (err) {
        next(err);
        return;
      }
      if (value) {
        var results = value.toString().split(',');
        console.log("Key found in memcached. Returning value = " + results);
        res.status(200).send(results).end();
        return;
      }

      var query = `SELECT * FROM Products WHERE ProductName LIKE '` + data + `%';`;
      console.log("Query string = " + query);
      var matching_products = [];
      database.run(query)
        .then((results) => {
          const rows = results[0];
          rows.forEach((row) => {
            const json = row.toJSON();
            console.log(`ProductId: ${json.ProductId.value}, ProductName: ${json.ProductName}`);
            matching_products.push(json.ProductName);
          });
          console.log(matching_products);
          // Add to memcached
          mc.set(data, matching_products.toString(), {expires:600}, (err) => {
            if (err) {
              next(err);
              //res.status(500).send("Error storing data into memcached").end();
              return;
            }
            // Send response back to the client
            res.status(200).send(matching_products).end();
          });         
        });
    });      		
});