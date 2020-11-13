--We need to alter the table before we can remove the TYPE

ALTER TABLE blogful_articles DROP COLUMN IF EXISTS style;

DROP TYPE IF EXISTS article_category;