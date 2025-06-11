import { Express, Request, Response } from "express";
import { FormatChecker, checkFormatAnyOf, checkFormatEquals, checkFormatIsBoolean, checkFormatIsObject, checkFormatIsString } from "../../../common/src/checkFormat";
import { requestHandlerBodyFormat } from "./middlewares";
import Database from "../database/database";
import { Models } from "../../../common/src/models";
import { passwordHashGenerate } from "../security/password";
import { tokenGenerate } from "../security/token";
import { requestsMiddlewareTokensVerify } from "./tokens";

export default function requestsMountUsers(app: Express) {
    requestsUsersPost(app);
    requestsUsersGetFromId(app);
    requestsUsersGetFromUsername(app);
    requestsUsersPatchPrivacy(app);
}

//
// Posts
//

const checkFormatUsersPost: FormatChecker = checkFormatIsObject({
    username: checkFormatIsString,
    password: checkFormatIsString,
});

function requestsUsersPost(app: Express) {
    app.post("/users",
        requestHandlerBodyFormat(checkFormatUsersPost),
        (req: Request, res: Response<string>) => {
            const username = req.body.username as string;
            const password = req.body.password as string;
            passwordHashGenerate(password)
                .then(passwordHash => Database.queries().createUser(username, passwordHash))
                .then(userQueryResponse => {
                    if (Database.onNonSuccess(res, 403, userQueryResponse))
                        return;
                    const user = Database.getData(userQueryResponse);

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
        }
    );
}

//
// Gets
//

function requestsUsersGetFromId(app: Express) {
    app.get("/users/id/:id", async (req: Request, res: Response<Models.User>) => {
        const userId = req.params.id;
        const userQueryResponse = await Database.queries().getUser(userId);
        if (Database.onNonSuccess(res, 404, userQueryResponse))
            return;
        const user = Database.getData(userQueryResponse);
        res.json(user);
    });
}

function requestsUsersGetFromUsername(app: Express) {
    app.get("/users/username/:username", async (req: Request, res: Response<Models.User>) => {
        const username = req.params.username;
        const userQueryResponse = await Database.queries().getUserFromUsername(username);
        if (Database.onNonSuccess(res, 404, userQueryResponse))
            return;
        const user = Database.getData(userQueryResponse);
        res.json(user);
    });
}

//
// Patches
//

const checkFormatUsersPatchPrivacy = checkFormatIsObject({
    isPrivate: checkFormatAnyOf([
        checkFormatEquals("true"),
        checkFormatEquals("false")
    ])
});

function requestsUsersPatchPrivacy(app: Express) {
    app.patch("/users/privacy/:id",
        requestsMiddlewareTokensVerify(Models.formatCheckerUser),
        requestHandlerBodyFormat(checkFormatUsersPatchPrivacy),
        async (req: Request, res: Response) => {
            const user = req.tokenData as Models.User;
            const userId = user.id;
            const isPrivate = req.body.isPrivate as "true" | "false";
            const _isPrivate = isPrivate == "true";

            const queryResponse = await Database.queries().setUserPrivacy(userId, _isPrivate);
            if (Database.onNonSuccess(res, 404, queryResponse))
                return;
            res.sendStatus(204);
        }
    );
}
