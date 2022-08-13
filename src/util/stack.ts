// Credit to https://stackoverflow.com/a/66842927/14545744
export function getCallerFromStack(): any {
    const err = new Error();

    Error.prepareStackTrace = (_, stack) => stack;

    const stack = err.stack;

    Error.prepareStackTrace = undefined;

    // @ts-ignore
    return stack[1].getFileName();
}
