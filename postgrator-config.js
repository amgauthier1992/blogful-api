require('dotenv').config();

module.exports = {
  "migrationsDirectory": "migrations",
  "driver": "pg",
  "password": "",
  "connectionString": (process.env.NODE_ENV === 'test')
  ? process.env.TEST_DATABASE_URL //use test db url in testing environment. 
  : process.env.DATABASE_URL, //grabbing the db url to run the migrations for when we deploy. we will initially run migrations concurrent with our 1st deployment.
  "ssl": !!process.env.SSL,
}

//add our db as a env variable in .env

//We can use the migrations to set up this database. Let's make use of the NODE_ENV 
//environment variable with a value of 'test' to signify to the migration config that we 
//wish to migrate the test database. We can then make a migration script that sets NODE_ENV to
//"test" for the one time command. 
//The driver refers to the same driver setting we used when creating a 

//Knex instance (driver for postgres?). We need to install that driver again
//as Knex wiull need this driver too. As a result, we can install it as a
//normal dependency- npm i pg

//The migrationsDirectory refers to the folder in our application that 
//contains our migration steps- "./migrations"