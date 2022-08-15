declare type LogLevel = 'debug' | 'info' | 'warn' | 'error';
declare type Logger = {
    debug: (message: string, error?: any) => void;
    info: (message: string, error?: any) => void;
    warn: (message: string, error?: any) => void;
    error: (message: string, error?: any) => void;
};
declare type LogWriteSettings = {
    write: boolean;
    file?: string;
    levelsToWrite: LogLevel[] | 'all' | 'none' | '*';
};
declare type CallerReplacements = {
    [key: string]: string;
};
declare type LogRequirements = {
    [key in LogLevel]: boolean;
};
declare type Format = {
    [key in LogLevel]: string;
};
declare class LoggerFactory {
    private loggers;
    constructor();
    getLogger(name: string): LoggerClass | undefined;
    createLogger(name: string, format: Format, write: LogWriteSettings, callerReplacements: CallerReplacements, requirements: LogRequirements): LoggerClass;
    deleteLogger(name: string): void;
    getLoggers(): Map<string, LoggerClass>;
}
declare class LoggerClass {
    private readonly callerReplacements;
    private readonly requirements;
    private readonly format;
    private readonly levelsToWrite;
    private readonly file;
    private readonly shouldWrite;
    constructor(format: Format, levelsToWrite?: LogLevel[], write?: boolean, file?: string, callerReplacements?: CallerReplacements, requirements?: LogRequirements);
    private write;
    private formatMessage;
    debug(message: string, error?: any): void;
    info(message: string, error?: any): void;
    warn(message: string, error?: any): void;
    error(message: string, error?: any): void;
}
export { Logger, LogLevel, Format, LogRequirements as Requirements };
export default LoggerFactory;
//# sourceMappingURL=logger.d.ts.map