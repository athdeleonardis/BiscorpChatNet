import { Express, Request, Response, NextFunction } from "express";
import https from "https";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const port_https = process.env.PORT_HTTPS as string;

const certificate_file_path = process.env.CERTIFICATE as string;
const certificate_key_file_path = process.env.CERTIFICATE_KEY as string;
const certificate_key_passphrase = process.env.CERTIFICATE_KEY_PASSPHRASE as string;
const certificate_encoding = process.env.CERTIFICATE_ENCODING as BufferEncoding;

const certificate = fs.readFileSync(certificate_file_path, certificate_encoding);
const certificate_key = fs.readFileSync(certificate_key_file_path, certificate_encoding);
const credentials = { cert: certificate, key: certificate_key, passphrase: certificate_key_passphrase }

export function createHttpsServer(app: Express): https.Server {
    return https.createServer(credentials, app);
}

export function requestMiddlewareHttpsRedirect(req: Request, res: Response, next: NextFunction): void {
    if (req.secure) {
        next();
        return;
    }
    res.redirect(`https://${req.hostname}:${port_https}${req.originalUrl}`);
}
