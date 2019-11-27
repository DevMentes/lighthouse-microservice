const express = require("express");
const parser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const lighthouse = require("lighthouse");
const ReportGenerator = require("lighthouse/lighthouse-core/report/report-generator");

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(parser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to lighthouse-microservice.",
    status: {
      general: true
    }
  });
});

const chromeLauncher = require("chrome-launcher");

const launchChromeAndRunLighthouse = (url, opts, config = null) => {
  return chromeLauncher
    .launch({ chromeFlags: opts.chromeFlags })
    .then(chrome => {
      opts.port = chrome.port;
      return lighthouse(url, opts, config).then(results => {
        // use results.lhr for the JS-consumeable output
        // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
        // use results.report for the HTML/JSON/CSV output as a string
        // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
        return chrome.kill().then(() => results.lhr);
      });
    });
};

const get = async url => {
  const report = await lighthouse(url, { port: 3000 }, null).then(results => {
    return results;
  });
  return ReportGenerator.generateReport(report.lhr, "html");
};

app.get("/report/:url", (request, response) => {
  const { url } = request.params;

  const opts = {
    chromeFlags: ["--no-sandbox", "--headless", "--disable-gpu"]
  };
  launchChromeAndRunLighthouse(decodeURI(url), opts)
    .then(results => response.json({ data: results }))
    .catch(error => response.json({ error: error.message }));
});

module.exports = app;
