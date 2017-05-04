/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START datastore_quickstart]
// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');

// Your Google Cloud Platform project ID
const projectId = 'bigquery-bestbuy';

// Instantiates a client
const datastore = Datastore({
  projectId: projectId
});

// The kind for the new entity
const kind = 'Task';
var task;
var taskKey = '';
//Parse the JSON
var jsonfile = require('jsonfile')
var file = 'products.json'
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
  	datastore.save(task)
  	  .then(() => {
    	console.log(i, `Saved ${task.data.name}`);
  	  });
  }
  console.log('Data exported to Datastore successfully')
})


// [END datastore_quickstart]
