import { test, expect } from "@jest/globals"
import { passwordHashGenerate, passwordHashVerify } from "../../src/security/password"

test('password hash checking', async () => {
    const passwords = ["AbCdEfG", "aBcDeFg", "1234", "xyz"];
    const hashes = await Promise.all(passwords.map(passwordHashGenerate));
    for (let i = 0; i < passwords.length; i++) {
        const password = passwords[i];
        for (let j = 0; j < hashes.length; j++) {
            const hash = hashes[j];
            await expect(passwordHashVerify(password, hash)).resolves.toBe(i == j);
        }
    }
});
