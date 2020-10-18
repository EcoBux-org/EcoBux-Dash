# EcoBux Dashboard

## Setup

First, download and install the main EcoBux contract repository

With your directory tree looking as such:

```
Main directory
|--EcoBux/ (Contract repo)
|    |--Contracts/
|    |--build/
|--Website/ (This repo)
```

Run a http server in the main directory like so:
`python -m SimpleHTTPServer`

And then go to [http://localhost:8000/website](http://localhost:8000/website)

## Making Changes

If you need to make changes to the dashboard environment, you must recompile the `viz.js` file with the following line:
`browserify viz.js -o main.js`
