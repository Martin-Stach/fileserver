# 🐘 PostgreSQL Local Setup & Recovery Guide

1. Verify the Service
If the database won't connect, check if the "heart" of Postgres is beating.

On Linux (Systemd):

## Check status (Look for 'active (running)')

systemctl status postgresql-16

## If it's stopped, start it

sudo systemctl start postgresql-16

## Make it start automatically on boot

sudo systemctl enable postgresql-16

2. The “Superuser” Entry
If you get "Peer authentication failed," use the system's postgres user to bypass it.

sudo -u postgres psql

3. Database & User Setup
Run these commands inside the psql prompt to prepare the realm.

-- Create the project database
CREATE DATABASE chirpy;

-- Create a dedicated user with a strong password
CREATE USER martin WITH PASSWORD 'your_secure_password_here';

-- Grant the user power over the database
GRANT ALL PRIVILEGES ON DATABASE chirpy TO martin;

-- Exit the prompt
\q

4. Environment Configuration
Update your .env file with the connection string. Never commit this file to Git!

## Format: postgres://USER:PASSWORD@HOST:PORT/DATABASE

DB_URL="postgres://martin:your_secure_password_here@localhost:5432/chirpy?sslmode=disable"

5. Testing the Connection
Before starting your server, verify the credentials from the terminal:

psql "postgres://martin:your_secure_password_here@localhost:5432/chirpy"

6. Common Incantations (Troubleshooting)
"Role 'martin' does not exist": Run the CREATE USER command in step 3.
"Database 'chirpy' does not exist": Run the CREATE DATABASE command in step 3.
"Password authentication failed": Run ALTER USER martin WITH PASSWORD 'new_password'; inside psql.
"Shared memory segment" error: Usually solved by sudo systemctl restart postgresql-16.
