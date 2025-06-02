import { Request, Response, NextFunction, RequestHandler } from "express"
import { FormatChecker } from "../../../common/src/checkFormat"

export function requestHandlerBodyFormat(formatChecker: FormatChecker): RequestHandler {
    const requestHandler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
        if (!formatChecker(req.body)) {
            res.sendStatus(422);
            return;
        }
        next();
    }
    return requestHandler;
}

export function requestHandlerParamsFormat(formatChecker: FormatChecker): RequestHandler {
    const requestHandler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
        if (!formatChecker(req.params)) {
            res.sendStatus(400);
            return;
        }
        next();
    }
    return requestHandler;
}
