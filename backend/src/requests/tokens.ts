import { Express, Request, Response, RequestHandler, NextFunction } from "express"
import Database from "../database/database"
import { FormatChecker, checkFormatIsObject, checkFormatIsString, checkFormatAll, checkFormatStringPrefix } from "../../../common/src/checkFormat"
import { requestHandlerBodyFormat } from "./middlewares";
import { tokenGenerate, tokenVerify } from "../security/token";

export default function requestsMountTokens(app: Express) {
    requestsTokensPostGenerate(app);
}

const checkFormatTokensPostGenerate: FormatChecker = checkFormatIsObject({
    username: checkFormatIsString,
    password: checkFormatIsString
});

function requestsTokensPostGenerate(app: Express) {
    app.post("/tokens/generate",
        requestHandlerBodyFormat(checkFormatTokensPostGenerate),
        async (req: Request, res: Response<string>) => {
            const username = req.body.username;
            const password = req.body.password;
            const userQueryResponse = await Database.queries().getUserFromUsernameAndPassword(username, password);
            if (Database.onNonSuccess(res, 401, userQueryResponse))
                return;
            const user = Database.getData(userQueryResponse);

            const token = tokenGenerate(user);
            if (token === null) {
                res.sendStatus(500);
                return;
            }
            res.json(token);
        }
    );
}

const checkFormatHeaderToken: FormatChecker = checkFormatIsObject({
    authorization: checkFormatAll([
        checkFormatIsString,
        checkFormatStringPrefix("Bearer ")
    ])
});

export function requestsMiddlewareTokensVerify(formatCheckerTokenData: FormatChecker): RequestHandler {
    const requestHandler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
        if (!checkFormatHeaderToken(req.headers)) {
            res.sendStatus(401);
            return;
        }
        const authorization = req.headers.authorization as string;
        const token = authorization.substring("Bearer ".length);
        const verification = tokenVerify(token);
        if (verification == null) {
            res.sendStatus(401);
            return;
        }
        const tokenData = verification.tokenData;
        if (!formatCheckerTokenData(tokenData)) {
            res.sendStatus(401);
            return;
        }
        req.tokenData = tokenData;
        next();
    }
    return requestHandler;
}

export function requestsMiddlewareTokensVerifyUnrequired(formatCheckerTokenData: FormatChecker): RequestHandler {
    const requestHandler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
        if (!checkFormatHeaderToken(req.headers)) {
            next();
            return;
        }
        const authorization = req.headers.authorization as string;
        const token = authorization.substring("Bearer ".length);
        const verification = tokenVerify(token);
        if (verification == null) {
            next();
            return;
        }
        const tokenData = verification.tokenData;
        if (!formatCheckerTokenData(tokenData)) {
            next();
            return;
        }
        req.tokenData = tokenData;
        next();
    }
    return requestHandler;
}
