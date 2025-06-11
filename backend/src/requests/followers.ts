import { Express, Request, Response } from "express";
import Database from "../database/database";
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
        async (req: Request, res: Response) => {
            const user = req.tokenData as Models.User;
            const followingId = req.params.userId;

            const followerQueryResponse = await  Database.queries().createFollower(user.id, followingId);
            if (Database.onNonSuccess(res, 404, followerQueryResponse))
                return;
            const follower = Database.getData(followerQueryResponse);
            
            res.json(follower);
        }
    );
}

function requestsFollowersGetFromUserId(app: Express) {
    app.get("/followers/:userId",
        requestsMiddlewareTokensVerifyUnrequired(Models.formatCheckerUser),
        async (req: Request, res: Response<Models.User[]>) => {
            const userId = req.params.userId;

            const userQueryResponse = await Database.queries().getUser(userId);
            if (Database.onNonSuccess(res, 404, userQueryResponse))
                return;
            const user = Database.getData(userQueryResponse);

            if (user.isPrivate) {
                const tokenUser = req.tokenData as Models.User | undefined;
                if (tokenUser === undefined) {
                    res.sendStatus(403);
                    return;
                }

                if (user.id !== tokenUser.id) {
                    const isFollowingQueryResponse = await Database.queries().checkFollowers(userId, tokenUser.id);
                    if (Database.onNonSuccess(res, 404, isFollowingQueryResponse))
                        return;
                    const isFollowing = Database.getData(isFollowingQueryResponse);

                    if (!isFollowing) {
                        res.sendStatus(403);
                        return;
                    }
                }
            }

            const followersQueryResponse = await Database.queries().getUserFollowers(userId);
            if (Database.onNonSuccess(res, 404, followersQueryResponse))
                return;
            const followers = Database.getData(followersQueryResponse);
            
            res.json(followers);
        }
    );
}
