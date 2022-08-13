# Logger

An advanced, completely configurable Logger for JS & TS.

## Installation

```bash
npm install --save @exortions/logger
yarn add @exortions/logger
```

## Usage

```typescript
import LoggerFactory from '@exortions/logger';

// Package for using colors
import colors from 'colors';

// initialize the factory

const factory = new LoggerFactory();

// create a logger
const logger = factory.createLogger(
    'my-logger',
    // Formatting
    {
        debug: colors.bold(colors.cyan('[$[caller]] $[message]')),
        info: colors.bold(colors.blue('[$[caller]] $[message]')),
        warn: colors.bold(colors.yellow('[$[caller]] $[message]')),
        error: colors.bold(colors.red('[$[caller]] $[message] $[err]'))
    },
    // File logging options
    {
        levelsToWrite: ['debug', 'info', 'warn', 'error'], // or '*' or 'all' or 'none',
        write: true, // if false, no logs will be written to file.
        file: path.join(__dirname, '../logs/' + new Date().toISOString() + '.log')
    },
    // Caller name replacements
    {
        Index: 'Main' // first is always uppercase, so not index, but Index, even if the filename is 'index.js'.
    },
    // Requirements for a log:
    {
        debug: true, // could be something like process.env.DEBUG === 'true'
        info: true,
        warn: true,
        error: true
    }
)

logger.debug('This is a debug message');
logger.info('This is an info message');
logger.warn('This is a warn message');
logger.error('This is an error message');
logger.error('This is an error message with an error', new Error('This is an error'));

// example of using the Logger type
function getMyLogger(): Logger | undefined {
    return factory.getLogger('my-logger');
}

// make sure the logger is actually created
const myLogger = getMyLogger();

if (!myLogger) throw new Error('Logger not found');

console.log(myLogger === logger); // true

```

All placeholders are contained inside the $[] brackets.

Placeholders:
```
message
month
day
year
hour
minute
second
ms
caller - the name of the caller file, for example: index.js -> Index
err - the error, if any or empty string
pid
ppid
time
timezone
uptime
memory
memory-rss
memory-heap-total
memory-heap-used
memory-external
memory-b
memory-kb
memory-mb
memory-gb
```