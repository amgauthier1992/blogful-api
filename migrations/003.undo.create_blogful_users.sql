--does the reverse of 003.do - alter articles table, removing author column
--then delete users table

ALTER TABLE blogful_articles
  DROP COLUMN author;

DROP TABLE IF EXISTS blogful_users;