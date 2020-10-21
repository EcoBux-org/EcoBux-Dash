# EcoBux Dashboard

# Setup

## Website

This development enviroment is hosted at [https://ecobux.lucas.tools](https://ecobux.lucas.tools)

## Local Installation

First, make sure all packages are installed with
`npm install`

Then, run a static http server in the main directory like so:
`npm run run`

And then go to [http://localhost:8000/](http://localhost:8000/)

### Making Changes

If you need to make changes to the dashboard environment, you must recompile the `viz.js` file with the following line:
`browserify viz.js -o main.js`
