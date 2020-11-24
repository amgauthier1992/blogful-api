//Notice we've used the DB_URL environment variable, the same variable used 
//in migrations (postgrator connects to our DB by reading the postgrator-config file
//containing the DB_URL as the 'connectionString'). 

//In production projects, we use different users (postgres roles) with different 
//levels of permissions (i.e. superuser etc.) for the app and for the migrations. 
//The migrations need more control to create and modify tables, the app should 
//not have this level of power. So, we should be keeping two sets of database 
//credentials and URLs in the .env, one for migrations and one for the app, however,
//for brevity, we aren't doing that in this project.

const knex = require('knex')
const app = require('./app');
const { PORT, DATABASE_URL } = require('./config');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL, //to test Postman against test-db, change this to TEST_DB_URL
})

//We can use an Express feature to set a property on the app object from the ./src/server.js 
//file. Using app.set('property-name', 'property-value') we can set a property called 'db' and 
//set the Knex instance from above as the value. This prevents our dependency cycle if we were 
//to import server.js into our app.js

app.set('db', db) //.set() adds property to express req object. Req.app === undefined unless we set() something

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
