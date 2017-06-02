# autocomplete
GCP autocomplete

1. jQuery frontend search.html + express backend app.js on App Engine
2. Cloud Datastore for storage (load_ds.sh uses the Datastore client library to load all the product names in products.json into Datastore)
3. Redis Labs Memcached to cache the query results which improves the responsiveness & performance of the application


