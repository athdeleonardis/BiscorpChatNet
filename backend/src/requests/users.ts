import { Express, Request, Response } from "express";
import { FormatChecker, checkFormatIsObject, checkFormatIsString } from "../../../common/src/checkFormat";
import { requestBodyFormatMiddleware } from "./requestBodyFormatMiddleware";
import { UserFrontend } from "../database";
import { databaseCreateUser, databaseGetUserFromUserId, databaseGetUserFromUsername } from "../database";

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
    app.post("/users", requestBodyFormatMiddleware(checkFormatUsersPost), (req: Request, res: Response) => {
        const username = req.body.username;
        const password = req.body.password;
        const user: UserFrontend | null = databaseCreateUser(username, password);
        if (user === null) {
            res.sendStatus(403);
            return;
        }
        res.json(user);
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
