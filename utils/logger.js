const fs = require('fs');
const path = require('path');
const winston = require('winston');

const logName = 'demo-winston.log';
const transports = [];

transports.push(new winston.transports.Console());

const logDir = 'logs';
if ( !fs.existsSync(logDir) ) {
    fs.mkdirSync(logDir);
}
const logFile = path.join(logDir, logName);
transports.push(new winston.transports.File({ filename: logFile }));

// AWS
const WinstonCloudWatch = require('winston-cloudwatch');
const CLOUDWATCH_GROUP_NAME = "<Log group name>";
const AWS_ACCESS_KEY = "<AWS access key>";
const AWS_SECRET_ACCESS_KEY = "<AWS secret key>";
const AWS_REGION = "<Region>";

const cloudwatchConfig = {
    level: 'debug',
    logGroupName: CLOUDWATCH_GROUP_NAME,
    logStreamName: logName,
    awsAccessKeyId: AWS_ACCESS_KEY,
    awsSecretKey: AWS_SECRET_ACCESS_KEY,
    awsRegion: AWS_REGION,
    messageFormatter: ({ level, message, additionalInfo }) => `[${level.toUpperCase()}]: ${message}`
}
transports.push(new WinstonCloudWatch(cloudwatchConfig));

// Google Cloud
const { LoggingWinston } = require('@google-cloud/logging-winston');
transports.push(new LoggingWinston());

// Azure
const appInsights = require('applicationinsights');
const { AzureApplicationInsightsLogger } = require('winston-azure-application-insights');
const INSTRUMENTATION_KEY = "<Instrummentation key>";

appInsights.setup(INSTRUMENTATION_KEY).start();
transports.push(new AzureApplicationInsightsLogger({ insights: appInsights, level: "silly" }));


const logger = new winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`)
    ),
    transports: transports
});

module.exports = logger;