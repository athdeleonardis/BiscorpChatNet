import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const jwt_secret = process.env.JWT_SECRET;
if (jwt_secret == undefined) {
    throw new Error("JWT secret undefined in '.env' file.");
}

export type JWTVerification = {
    tokenData: any
}

export function tokenGenerate(data: any): string | null {
    data.time = Date();
    if (jwt_secret == undefined)
        return null
    const token = jwt.sign(data, jwt_secret);
    return token;
}

export function tokenVerify(token: string): JWTVerification | null {
    if (jwt_secret == undefined)
        return null;
    const verification = jwt.verify(token, jwt_secret);
    if (verification)
        return { tokenData: verification }
    return null;
}
