import fs from "fs";

export default class Test {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    failure(reason: string) {
        const exitMessage = `TEST '${this.name}' -- FAILED -- ${reason}\n`;
        fs.writeSync(process.stdout.fd, exitMessage);
        process.exit(0);
    }

    success() {
        const successMessage = `TEST '${this.name}' -- SUCCESS\n`;
        fs.writeSync(process.stdout.fd, successMessage);
        process.exit(0);
    }

    assert(bool: boolean, failureReason: string) {
        if (!bool)
            this.failure(failureReason);
    }
}
