import { Express, Request, Response } from "express";
import { FormatChecker, checkFormatIsObject, checkFormatIsString } from "../../../common/src/checkFormat";
import { requestMiddlewareBodyFormat } from "./requestBodyFormatMiddleware";
import { UserFrontend } from "../database";
import { databaseCreateUser, databaseGetUserFromUserId, databaseGetUserFromUsername } from "../database";
import { passwordHashGenerate } from "../security/password";
import { tokenGenerate } from "../security/token";

export default function requestsMountUsers(app: Express) {
    requestsUsersPost(app);
    requestsUsersGetFromId(app);
    requestsUsersGetFromUsername(app);
}

//
// Posts
//

const checkFormatUsersPost: FormatChecker = checkFormatIsObject({
    username: checkFormatIsString,
    password: checkFormatIsString,
});

function requestsUsersPost(app: Express) {
    app.post("/users", requestMiddlewareBodyFormat(checkFormatUsersPost), (req: Request, res: Response) => {
        const username = req.body.username as string;
        const password = req.body.password as string;
        passwordHashGenerate(password)
            .then((passwordHash) => {
                const user: UserFrontend | null = databaseCreateUser(username, passwordHash);
                if (user === null) {
                    res.sendStatus(403);
                    return;
                }
                const token = tokenGenerate(user);
                if (token === null) {
                    res.sendStatus(500);
                    return;
                }
                res.json(token);
            })
            .catch((error) => {
                console.log(error);
                res.sendStatus(500);
            });
    });
}

//
// Gets
//

function requestsUsersGetFromId(app: Express) {
    app.get("/users/id/:id", (req: Request, res: Response) => {
        const user: UserFrontend | null = databaseGetUserFromUserId(req.params.id);
        if (user === null) {
            res.sendStatus(404);
            return;
        }
        res.json(user);
    });
}

function requestsUsersGetFromUsername(app: Express) {
    app.get("/users/username/:username", (req: Request, res: Response) => {
        const user: UserFrontend | null = databaseGetUserFromUsername(req.params.username);
        if (user === null) {
            res.sendStatus(404);
            return;
        }
        res.json(user);
    });
}
