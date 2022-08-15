import fs from 'fs';
import { getCallerFromStack } from './util/stack.js';
class LoggerFactory {
    constructor() {
        this.loggers = new Map();
    }
    getLogger(name) {
        return this.loggers.get(name);
    }
    createLogger(name, format, write, callerReplacements, requirements) {
        if (write.write && !write.file)
            throw new Error('File is required when write is true');
        let levelsToWrite = [];
        if (write.levelsToWrite === 'all')
            levelsToWrite = ['debug', 'info', 'warn', 'error'];
        else if (write.levelsToWrite === 'none')
            levelsToWrite = [];
        else if (write.levelsToWrite === '*')
            levelsToWrite = ['debug', 'info', 'warn', 'error'];
        else
            levelsToWrite = write.levelsToWrite;
        const logger = new LoggerClass(format, levelsToWrite, write.write, write.file, callerReplacements, requirements);
        this.loggers.set(name, logger);
        return logger;
    }
    deleteLogger(name) {
        this.loggers.delete(name);
    }
    getLoggers() {
        return this.loggers;
    }
}
class LoggerClass {
    constructor(format, levelsToWrite = ['debug', 'info', 'warn', 'error'], write = false, file, callerReplacements = {}, requirements = { debug: true, info: true, warn: true, error: true }) {
        this.levelsToWrite = ['debug', 'info', 'warn', 'error'];
        this.callerReplacements = callerReplacements;
        this.requirements = requirements;
        this.format = format;
        this.levelsToWrite = levelsToWrite;
        this.shouldWrite = write;
        this.file = file;
    }
    write(message) {
        if (!this.shouldWrite)
            return;
        if (!this.file)
            return;
        if (!fs.existsSync(this.file))
            fs.writeFileSync(this.file, '');
        fs.appendFileSync(this.file, `${new Date().toUTCString()} - ${message}\n`);
    }
    formatMessage(format, message, error) {
        let formattedMessage = format;
        formattedMessage = formattedMessage.replace(/\$\[message\]/g, message);
        const date = new Date();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        const ms = date.getMilliseconds();
        let caller = getCallerFromStack().toString();
        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
        caller = caller.replace(/\\/g, '/');
        caller = caller.substring(0, caller.lastIndexOf('.'));
        caller = caller.split('/').pop();
        caller = capitalize(caller);
        if (caller in this.callerReplacements)
            caller = this.callerReplacements[caller];
        const err = error ? error.toString() : '';
        const pid = process.pid;
        const ppid = process.ppid;
        const time = date.toLocaleString();
        const timezone = date.toLocaleTimeString();
        const uptime = process.uptime();
        const memory = process.memoryUsage();
        const memoryRSS = memory.rss;
        const memoryHeapTotal = memory.heapTotal;
        const memoryHeapUsed = memory.heapUsed;
        const memoryExternal = memory.external;
        const memoryB = memory.rss * 1024;
        const memoryKB = memory.rss / 1024;
        const memoryMB = memory.rss / (1024 * 1024);
        const memoryGB = memory.rss / (1024 * 1024 * 1024);
        formattedMessage = formattedMessage.replace(/\$\[month\]/g, month.toString());
        formattedMessage = formattedMessage.replace(/\$\[day\]/g, day.toString());
        formattedMessage = formattedMessage.replace(/\$\[year\]/g, year.toString());
        formattedMessage = formattedMessage.replace(/\$\[hour\]/g, hour.toString());
        formattedMessage = formattedMessage.replace(/\$\[minute\]/g, minute.toString());
        formattedMessage = formattedMessage.replace(/\$\[second\]/g, second.toString());
        formattedMessage = formattedMessage.replace(/\$\[ms\]/g, ms.toString());
        formattedMessage = formattedMessage.replace(/\$\[caller\]/g, caller);
        formattedMessage = formattedMessage.replace(/\$\[err\]/g, err);
        formattedMessage = formattedMessage.replace(/\$\[pid\]/g, pid.toString());
        formattedMessage = formattedMessage.replace(/\$\[ppid\]/g, ppid.toString());
        formattedMessage = formattedMessage.replace(/\$\[time\]/g, time);
        formattedMessage = formattedMessage.replace(/\$\[timezone\]/g, timezone);
        formattedMessage = formattedMessage.replace(/\$\[uptime\]/g, uptime.toString());
        formattedMessage = formattedMessage.replace(/\$\[memory\]/g, memory.toString());
        formattedMessage = formattedMessage.replace(/\$\[memory-rss\]/g, memoryRSS.toString());
        formattedMessage = formattedMessage.replace(/\$\[memory-heap-total\]/g, memoryHeapTotal.toString());
        formattedMessage = formattedMessage.replace(/\$\[memory-heap-used\]/g, memoryHeapUsed.toString());
        formattedMessage = formattedMessage.replace(/\$\[memory-external\]/g, memoryExternal.toString());
        formattedMessage = formattedMessage.replace(/\$\[memory-b\]/g, memoryB.toString());
        formattedMessage = formattedMessage.replace(/\$\[memory-kb\]/g, memoryKB.toString());
        formattedMessage = formattedMessage.replace(/\$\[memory-mb\]/g, memoryMB.toString());
        formattedMessage = formattedMessage.replace(/\$\[memory-gb\]/g, memoryGB.toString());
        return formattedMessage;
    }
    debug(message, error) {
        const req = this.requirements.debug;
        if (req !== undefined && req === false)
            return;
        const formatted = this.formatMessage(this.format.debug, message, error);
        if (this.levelsToWrite.includes('debug'))
            this.write(formatted);
        console.log(formatted);
    }
    info(message, error) {
        const req = this.requirements.info;
        if (req !== undefined && req === false)
            return;
        const formatted = this.formatMessage(this.format.info, message, error);
        if (this.levelsToWrite.includes('info'))
            this.write(formatted);
        console.log(formatted);
    }
    warn(message, error) {
        const req = this.requirements.warn;
        if (req !== undefined && req === false)
            return;
        const formatted = this.formatMessage(this.format.warn, message, error);
        if (this.levelsToWrite.includes('warn'))
            this.write(formatted);
        console.log(formatted);
    }
    error(message, error) {
        const req = this.requirements.error;
        if (req !== undefined && req === false)
            return;
        const formatted = this.formatMessage(this.format.error, message, error);
        if (this.levelsToWrite.includes('error'))
            this.write(formatted);
        console.log(formatted);
    }
}
export default LoggerFactory;
