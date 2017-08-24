"use strict";

const winston = require('winston');

import * as config from 'config';

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File) ({
            level: config.get('logger.file.level'),
            filename: config.get('logger.file.path'),
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new (winston.transports.Console) ({
            level: config.get('logger.console.level'),
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

export default logger;
