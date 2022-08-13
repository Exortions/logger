import fs from 'fs';

import { getCallerFromStack } from './util/stack.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type Logger = {
    debug: (message: string, error?: any) => void;
    info: (message: string, error?: any) => void;
    warn: (message: string, error?: any) => void;
    error: (message: string, error?: any) => void;
};
type LogWriteSettings = {
    write: boolean;
    file?: string;
    levelsToWrite: LogLevel[] | 'all' | 'none' | '*';
};
type CallerReplacements = {
    [key: string]: string;
};
type LogRequirements = {
    [key in LogLevel]: boolean;
};
type Format = {
    [key in LogLevel]: string;
};

class LoggerFactory {
    private loggers: Map<string, LoggerClass> = new Map();

    constructor() {}

    public getLogger(name: string): LoggerClass | undefined {
        return this.loggers.get(name);
    }

    public createLogger(
        name: string,
        format: Format,
        write: LogWriteSettings,
        callerReplacements: CallerReplacements,
        requirements: LogRequirements
    ): LoggerClass {
        if (write.write && !write.file) throw new Error('File is required when write is true');

        let levelsToWrite: LogLevel[] = [];

        if (write.levelsToWrite === 'all') levelsToWrite = ['debug', 'info', 'warn', 'error'];
        else if (write.levelsToWrite === 'none') levelsToWrite = [];
        else if (write.levelsToWrite === '*') levelsToWrite = ['debug', 'info', 'warn', 'error'];
        else levelsToWrite = write.levelsToWrite;

        const logger = new LoggerClass(
            format,
            levelsToWrite,
            write.write,
            write.file,
            callerReplacements,
            requirements
        );

        this.loggers.set(name, logger);

        return logger;
    }

    public deleteLogger(name: string): void {
        this.loggers.delete(name);
    }

    public getLoggers(): Map<string, LoggerClass> {
        return this.loggers;
    }
}

class LoggerClass {
    private readonly callerReplacements: CallerReplacements;

    private readonly requirements: LogRequirements;

    private readonly format: Format;

    private readonly levelsToWrite: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    private readonly file: string | undefined;
    private readonly shouldWrite: boolean;

    constructor(
        format: Format,
        levelsToWrite: LogLevel[] = ['debug', 'info', 'warn', 'error'],
        write: boolean = false,
        file?: string,
        callerReplacements: CallerReplacements = {},
        requirements: LogRequirements = { debug: true, info: true, warn: true, error: true }
    ) {
        this.callerReplacements = callerReplacements;

        this.requirements = requirements;

        this.format = format;

        this.levelsToWrite = levelsToWrite;
        this.shouldWrite = write;
        this.file = file;
    }

    private write(message: string): void {
        if (!this.shouldWrite) return;
        if (!this.file) return;

        if (!fs.existsSync(this.file)) fs.writeFileSync(this.file, '');

        fs.appendFileSync(this.file, `${new Date().toUTCString()} - ${message}\n`);
    }

    private formatMessage(format: string, message: string, error?: any): string {
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

        const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

        caller = caller.replace(/\\/g, '/');
        caller = caller.substring(0, caller.lastIndexOf('.'));
        caller = caller.split('/').pop();
        caller = capitalize(caller);

        if (caller in this.callerReplacements) caller = this.callerReplacements[caller];

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
        formattedMessage = formattedMessage.replace(
            /\$\[memory-heap-total\]/g,
            memoryHeapTotal.toString()
        );
        formattedMessage = formattedMessage.replace(
            /\$\[memory-heap-used\]/g,
            memoryHeapUsed.toString()
        );
        formattedMessage = formattedMessage.replace(
            /\$\[memory-external\]/g,
            memoryExternal.toString()
        );
        formattedMessage = formattedMessage.replace(/\$\[memory-b\]/g, memoryB.toString());
        formattedMessage = formattedMessage.replace(/\$\[memory-kb\]/g, memoryKB.toString());
        formattedMessage = formattedMessage.replace(/\$\[memory-mb\]/g, memoryMB.toString());
        formattedMessage = formattedMessage.replace(/\$\[memory-gb\]/g, memoryGB.toString());

        return formattedMessage;
    }

    public debug(message: string, error?: any) {
        const req = this.requirements.debug;

        if (req !== undefined && req === false) return;

        const formatted = this.formatMessage(this.format.debug, message, error);

        if (this.levelsToWrite.includes('debug')) this.write(formatted);

        console.log(formatted);
    }

    public info(message: string, error?: any) {
        const req = this.requirements.info;

        if (req !== undefined && req === false) return;

        const formatted = this.formatMessage(this.format.info, message, error);

        if (this.levelsToWrite.includes('info')) this.write(formatted);

        console.log(formatted);
    }

    public warn(message: string, error?: any) {
        const req = this.requirements.warn;

        if (req !== undefined && req === false) return;

        const formatted = this.formatMessage(this.format.warn, message, error);

        if (this.levelsToWrite.includes('warn')) this.write(formatted);

        console.log(formatted);
    }

    public error(message: string, error?: any) {
        const req = this.requirements.error;

        if (req !== undefined && req === false) return;

        const formatted = this.formatMessage(this.format.error, message, error);

        if (this.levelsToWrite.includes('error')) this.write(formatted);

        console.log(formatted);
    }
}

export { Logger, LogLevel, Format, LogRequirements as Requirements };
export default LoggerFactory;
