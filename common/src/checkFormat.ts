export type FormatChecker = (input: any) => boolean;

export function checkFormatIs(value: any): FormatChecker {
    return (input: any) => { return input === value };
}

export function checkFormatEquals(value: any): FormatChecker {
    return (input: any) => { return input == value };
}

export function checkFormatIsString(input: any): boolean {
    return typeof input === "string";
}

export function checkFormatIsNumber(input: any): boolean {
    return typeof input === "number";
}

export function checkFormatIsBoolean(input: any): boolean {
    return typeof input === "boolean";
}

export function checkFormatIsObject(formatObject: { [index: string]: FormatChecker }): FormatChecker {
    return (input: any) => {
        if (typeof input !== "object")
            return false;
        for (const key in formatObject) {
            if (!formatObject[key](input[key]))
                return false;
        }
        return true;
    }
}

export function checkFormatIsArray(format: FormatChecker): FormatChecker {
    return (input: any) => {
        if (!Array.isArray(input))
            return false;
        for (const element of input) {
            if (!format(element))
                return false;
        }
        return true;
    }
}

export function checkFormatAll(formats: FormatChecker[]): FormatChecker {
    return (input: any) => {
        for (const format of formats) {
            if (!format(input))
                return false;
        }
        return true;
    };
}

export function checkFormatAnyOf(formats: FormatChecker[]): FormatChecker {
    return (input: any) => {
        for (const format of formats) {
            if (format(input))
                return true;
        }
        return false;
    }
}

export function checkFormatStringPrefix(prefix: string): FormatChecker {
    return (input: any) => {
        let input1 = input as string;
        return (input1.startsWith(prefix))
    }
}
