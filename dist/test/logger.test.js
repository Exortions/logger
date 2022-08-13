import colors from 'colors';
import path from 'path';
import fs from 'fs';
import LoggerFactory from '../logger.js';
const __dirname = new URL(import.meta.url).pathname;
const format = {
    debug: colors.bold(colors.cyan('[$[caller]] $[message]')),
    info: colors.bold(colors.blue('[$[caller]] $[message]')),
    warn: colors.bold(colors.yellow('[$[caller]] $[message]')),
    error: colors.bold(colors.red('[$[caller]] $[message] $[err]'))
};
const requirements = {
    debug: true,
    info: true,
    warn: true,
    error: true
};
const factory = new LoggerFactory();
if (!fs.existsSync(path.join(__dirname, '../logs')))
    fs.mkdirSync(path.join(__dirname, '../logs'));
const logger = factory.createLogger('my-logger', format, {
    levelsToWrite: ['debug', 'info', 'warn', 'error'],
    write: true,
    file: path.join(__dirname, '../logs/' + new Date().toISOString() + '.log')
}, {
    Index: 'Main' // first is always uppercase, so not index, but Index, even if the filename is 'index.js'.
}, requirements);
logger.debug('This is a debug message');
logger.info('This is an info message');
logger.warn('This is a warn message');
logger.error('This is an error message');
logger.error('This is an error message with an error', new Error('This is an error'));
// example of using the Logger type
function getMyLogger() {
    return factory.getLogger('my-logger');
}
// make sure the logger is actually created
const myLogger = getMyLogger();
if (!myLogger)
    throw new Error('Logger not found');
console.log(myLogger === logger); // true
