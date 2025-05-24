import { Request, Response, NextFunction, RequestHandler } from "express"
import { FormatChecker } from "../../../common/src/checkFormat"

export function requestBodyFormatMiddleware(formatChecker: FormatChecker): RequestHandler {
    const requestHandler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
        if (!formatChecker(req.body)) {
            res.send(400);
            return;
        }
        next();
    }
    return requestHandler;
}
