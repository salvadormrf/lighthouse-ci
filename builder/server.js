'use strict';

const fs = require('fs');
const express = require('express');
const exec = require('child_process').exec;
const bodyParser = require('body-parser');

// const API_KEY_HEADER = 'X-API-KEY';
const PORT = 8080;


let newPort = 9222;

// function runLH(url, format = 'json', res, next) {
//   if (!url) {
//     res.status(400).send('Please provide a URL.');
//     return;
//   }

//   newPort = newPort + 1;
//   const file = `/tmp/report.${newPort}.${Date.now()}.${format}`;

//   const chromeFlags = "--headless --disable-gpu --no-first-run --disable-translate --disable-default-apps --disable-extensions";

//   exec(`lighthouse --output-path=${file} --output=${format} --port=${newPort} --chrome-flags="${chromeFlags}" ${url}`, (err, stdout, stderr) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send(err);
//       return;
//     }

//     // console.log(stdout);

//     res.sendFile(`/${file}`, {}, err => {
//       if (err) {
//         next(err);
//       }
//       fs.unlink(file);
//     });
//   });
// }


const lighthouse = require('lighthouse');
const chromeLauncher = require('lighthouse/chrome-launcher');

function launchChromeAndRunLighthouse(url, lighthouseOpts={}, launcherOpts={}, lighthouseConfig=null) {
  return chromeLauncher.launch(launcherOpts).then(chrome => {
    return lighthouse(url, lighthouseOpts, lighthouseConfig).then(results =>
      chrome.kill().then(() => results));
  });
}



const app = express();
app.use(bodyParser.json());

app.post('/ci', (req, res, next) => {
  // runLH(req.body.url, req.body.format, res, next);
  
  newPort = newPort + 1;

  const lighthouseOpts = {
    output: 'json',
    port: newPort,
  };
  const launcherOpts = {
    port: newPort,
    chromeFlags: [
      '--headless',
      '--disable-gpu',
      '--no-first-run',
      '--disable-translate',
      '--disable-default-apps',
      '--disable-extensions'
    ],
    startingUrl: 'about:blank',
    logLevel: 'info',
  };
  
  launchChromeAndRunLighthouse(req.body.url, lighthouseOpts, launcherOpts).then(results => {
    // Use results!
    res.send(results);
  });

});

app.listen(PORT);
console.log(`Running on http://localhost:${PORT}`);
