import * as crypto from "crypto";

const HASH_ITERATIONS = 1000;
const SALT_LENGTH = 16;
const HASH_LENGTH = 256;
const BYTE_ENCODING = "base64";
const HASH_DIGEST = "sha256";
const RFC_2307_PASSWORD_PREFIX = "X-PBKDF2";
const RFC_2307_PASSWORD_HASH_DIGEST = "HMACSHA256";

type PasswordHash = {
    iterations: number,
    salt: string,
    hash: string,
};

export function passwordHashGenerate(password: string): Promise<string> {
    return new Promise<string>((accept, reject) => {
        const salt = crypto.randomBytes(SALT_LENGTH).toString(BYTE_ENCODING);
        crypto.pbkdf2(password, salt, HASH_ITERATIONS, HASH_LENGTH, HASH_DIGEST, (error, hash) => {
            if (error) {
                return reject(error);
            }

            const passwordHash: PasswordHash = {
                iterations: HASH_ITERATIONS,
                salt: salt,
                hash: hash.toString(BYTE_ENCODING)
            };

            accept(passwordHashToHashString(passwordHash));
        });
    });
}

export function passwordHashVerify(password: string, hashString: string): Promise<boolean> {
    return new Promise<boolean>((accept, reject) => {
        const hashData = passwordHashStringToHash(hashString);
        if (hashData == null) {
            return accept(false);
        }

        crypto.pbkdf2(password, hashData.salt, hashData.iterations, HASH_LENGTH, HASH_DIGEST, (error, hash) => {
            if (error) {
                return reject(error);
            }
            const hashEncoding = hash.toString(BYTE_ENCODING);
            accept(hashData.hash === hashEncoding);
        });
    });
}

function passwordHashToHashString(passwordHash: PasswordHash): string {
    const iterations = btoa(passwordHash.iterations.toString());
    return `{${RFC_2307_PASSWORD_PREFIX}}${RFC_2307_PASSWORD_HASH_DIGEST}:${iterations}:${passwordHash.salt}:${passwordHash.hash}`;
}

function passwordHashStringToHash(passwordHashString: string): PasswordHash | null {
    const hashStringSections = passwordHashString.split(":");
    if (hashStringSections.length != 4) {
        return null;
    }
    if (hashStringSections[0] !== `{${RFC_2307_PASSWORD_PREFIX}}${RFC_2307_PASSWORD_HASH_DIGEST}`) {
        return null;
    }
    const iterationsString = atob(hashStringSections[1]);
    const iterations = parseInt(iterationsString, 10);
    if (isNaN(iterations)) {
        return null;
    }
    const passwordHash: PasswordHash = {
        iterations: iterations,
        salt: hashStringSections[2],
        hash: hashStringSections[3]
    };
    return passwordHash;
}
