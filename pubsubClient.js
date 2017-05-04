"use strict";

// Imports the Google Cloud client library
const PubSub = require('@google-cloud/pubsub');

// Your Google Cloud Platform project ID
const projectId = 'bigquery-bestbuy';

// Instantiates a client
const pubsubClient = PubSub({
  	projectId: projectId
});

// References an existing topic, e.g. "my-topic"
const topic = pubsubClient.topic('autocomplete');

//publishMessage ('Hello KP');

function publishMessage (data) {
	// Publishes the message, e.g. "Hello, world!" or { amount: 599.00, status: 'pending' }
	return topic.publish(data)
  		.then((results) => {
    	  const messageIds = results[0];

    	  console.log(`Message ${messageIds[0]} published.`);

    	  return messageIds;
  		});
}
