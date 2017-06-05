const express = require('express');
const bodyParser = require("body-parser");
//const expressLogging = require('express-logging');
//const logger = require('logops');
const path = require('path');
const memjs = require('memjs');
// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');

const app = express();

// Your Google Cloud Platform project ID
const projectId = 'gstore-autocomplete';

// Instantiates a Datastore client
const datastore = Datastore({
  projectId: projectId
});

//app.use(expressLogging(logger));
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

function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}

function find_end(start) {
    var lchar = start.slice(-1);
    //console.log("Last char = " + lchar);
    var rchars = start.slice(0, -1);
    //console.log("Rchars = " + rchars);  
    var nchar = nextChar(lchar);
    //console.log("Next char to last = " + nchar);
    return rchars.concat(nchar);
}

app.get('/', function(req, res) {   
    res.sendFile(path.join(__dirname+'/search.html'));
});

app.post('/data', function(req, res) {
	  var data = req.body.term;
    console.log("Data received from keypress = " + data);

    var start = data;
    var end = find_end(start);
 
    //console.log("End = " + end);

    // Check in Memcache if this key exists
    mc.get(data, (err, value) => {
      if (err) {
        next(err);
        return;
      }
      if (value) {
        var results = JSON.parse(value);
        console.log("Key found in memcached. Sending result directly to the client");
        res.status(200).send(results).end();
        return;
      }

      var matching_products = [];
      const query = datastore.createQuery('Products')
        .filter('name', '>=', start)
        .filter('name', '<', end);

      console.log("Key not found in memcached"); 
      console.log("Sending query: SELECT * from Products where name >= '" + start + "' and name < '" + end + "' to Datastore");
      datastore.runQuery(query)
        .then((results) => {
          // Task entities found.
          const tasks = results[0];

          tasks.forEach((task) => {
            matching_products.push(task.name);
          });

          mc.set(data, JSON.stringify(matching_products), {expires:600}, (err) => {
            if (err) {
              next(err);
              return;
            }
          });
          // Send response back to the client
          res.status(200).send(matching_products).end();  
        });
    });      		
});