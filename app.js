const express = require('express');
const bodyParser = require("body-parser");
const app = express();

const expressLogging = require('express-logging');
const logger = require('logops');
 
const mysql = require('mysql');
const path = require('path');

app.use(expressLogging(logger));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());

// Your Google Cloud Platform project ID
const projectId = 'autocomplete-166617';

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
   console.log(`App listening on port ${PORT}`);
   console.log('Press Ctrl+C to quit.');
});

/**
 * Create a new connection.
 *
 * @param {function} callback The callback function.
 */
function getConnection (callback) {
    const user = 'kunal';
    const password = 'nginx';
    const database = 'guestbook';

    const uri = `mysql://${user}:${password}@127.0.0.1:3306/${database}`;
    callback(null, mysql.createConnection(uri));
}

/**
 * Get all the product names that startsWith user input
 *
 * @param {object} connection A mysql connection object.
 * @param {function} callback The callback function.
 */
function get_autocomplete (connection, query_string, callback) {
  connection.query(query_string, (err, results) => {
    if (err) {
      callback(err);
      return;
    }

    callback(null, results);
  });
}

app.get('/', function(req, res) {
    
    res.sendFile(path.join(__dirname+'/search.html'));
});

app.post('/data', function(req, res) {
	var data = req.body.term;
    console.log("Data received from keypress = " + data);
    var query_string = `SELECT * FROM products WHERE ProductName LIKE '` + data + `%';`;
    console.log("Query string = " + query_string);

    getConnection((err, connection) => {
  		if (err) {
      		console.error(err);
      		return;
  		}
  		get_autocomplete(connection, query_string, (err, result) => {
    		connection.end();
    		if (err) {
      			console.error(err);
      			return;
    		}
    		console.log('----------------------')
    		
    		console.log(result);
    		res.status(200).send(result).end();
  		});
	});   
});

