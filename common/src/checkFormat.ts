export type FormatChecker = (input: any) => boolean;

export function checkFormatIsString(input: any): boolean {
    return typeof input === "string";
}

export function checkFormatIsNumber(input: any): boolean {
    return typeof input === "number";
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
