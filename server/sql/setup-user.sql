-- Run once as a PostgreSQL superuser (often the "postgres" user).
CREATE USER quran WITH PASSWORD 'quran';
CREATE DATABASE quran_academy OWNER quran;
GRANT ALL PRIVILEGES ON DATABASE quran_academy TO quran;
