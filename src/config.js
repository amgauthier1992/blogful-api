module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_TOKEN: process.env.API_TOKEN || 'dummy-api-token',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dunder_mifflin@localhost/blogful', 
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://dunder_mifflin@localhost/blogful-test'
};

//export DB_URL with a default value 