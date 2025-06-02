import { Express, Request, Response } from "express";
import { databaseCheckUserFollowers, databaseCreateFollow, databaseGetUserFollowers, databaseGetUserFromUserId } from "../database";
import { requestsMiddlewareTokensVerify, requestsMiddlewareTokensVerifyUnrequired } from "./tokens";
import { Models } from "../../../common/src/models";
import { checkFormatIsObject, checkFormatIsString, FormatChecker } from "../../../common/src/checkFormat";
import { requestHandlerBodyFormat } from "./middlewares";

export default function requestsMountFollowers(app: Express) {
    requestsFollowersPost(app);
    requestsFollowersGetFromUserId(app);
}

const followsPostBody: FormatChecker = checkFormatIsObject({
    followingId: checkFormatIsString
});

function requestsFollowersPost(app: Express) {
    app.post("/followers/:followingId",
        requestsMiddlewareTokensVerify(Models.formatCheckerUser),
        requestHandlerBodyFormat(followsPostBody),
        (req: Request, res: Response) => {
            const user = req.tokenData as Models.User;
            const followingId = req.params.userId;
            const newFollow: boolean | null = databaseCreateFollow(user.id, followingId);
            if (newFollow === null) {
                res.sendStatus(404);
                return;
            }
            if (newFollow === false) {
                res.sendStatus(200);
                return;
            }
            res.sendStatus(201);
        }
    );
}

function requestsFollowersGetFromUserId(app: Express) {
    app.get("/followers/:userId",
        requestsMiddlewareTokensVerifyUnrequired(Models.formatCheckerUser),
        (req: Request, res: Response) => {
            const userId = req.params.userId;
            const user = databaseGetUserFromUserId(userId);
            if (user === null) {
                res.sendStatus(404);
                return;
            }
            if (user.isPrivate) {
                const tokenUser = req.tokenData as Models.User | undefined;
                if (tokenUser === undefined) {
                    res.sendStatus(403);
                    return;
                }
                const followerCheck = databaseCheckUserFollowers(userId, tokenUser.id);
                if (!followerCheck) {
                    res.sendStatus(403);
                    return;
                }
            }
            const followers: string[] | null = databaseGetUserFollowers(req.params.userId);
            if (followers === null) {
                res.sendStatus(404);
                return;
            }
            res.json(followers);
        }
    );
}
