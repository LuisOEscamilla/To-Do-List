# To-Do-List

# Installation instructions

## Install node with homebrew
brew install node

## Install MongoDB with homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

## Create package.json
npm init -y

## Install runtime packages
npm install express mongoose express-session connect-mongo bcrypt

## Create local database folder in project directory
mkdir -p data

## Start database and server
These will be done in two separate terminals.

### Start database
mongod --dbpath ./data --bind_ip 127.0.0.1

### Start server
node server.js