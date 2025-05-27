import { passwordHashGenerate, passwordHashVerify } from "../../src/security/password"
import * as fs from "fs"

const passwords = ["AbCdEfG", "aBcDeFg", "1234", "xyz"];
const hashPromises = passwords
    .map((password, i) => {
        return new Promise<string>((accept, reject) => {
            passwordHashGenerate(password)
                .then((hash) => {
                    accept(hash);
                })
                .catch((error) => testFailed(`hash generate -- ${i}`));
        });
    });

Promise.all(hashPromises)
    .then((hashes) => {
        const tests: Promise<boolean>[] = [];
        passwords.forEach((password, i) => {
            hashes.forEach((hash, j) => {
                const test = new Promise<boolean>((accept, reject) => {
                    passwordHashVerify(password, hash)
                        .then((result) => {
                            if (result != (i == j)) {
                                testFailed(`comparison -- ${i},${j}`);
                            }
                            accept(result);
                        })
                        .catch((error) => testFailed(`hash verify -- ${i},${j}`));
                })
                tests.push(test);
            });
        });
        Promise.all(tests)
            .then((_) => testSuccess());
    });

function testFailed(reason: string) {
    const exitMessage = `TEST 'password' -- FAILED -- ${reason}\n`;
    fs.writeSync(process.stdout.fd, exitMessage);
    process.exit(0);
}

function testSuccess() {
    const successMessage = `TEST 'password' -- SUCCESS\n`;
    fs.writeSync(process.stdout.fd, successMessage);
    process.exit(0);
}
