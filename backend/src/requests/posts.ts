import { Express, Request, Response } from "express";
import { databaseCheckUserFollowers, databaseCreatePost, databaseCreateReply, databaseGetPostFromPostId, databaseGetPostsFromUserId, databaseGetRepliesFromPostId, databaseGetUserFromUserId } from "../database";
import { Models } from "../../../common/src/models";
import { requestsMiddlewareTokensVerify, requestsMiddlewareTokensVerifyUnrequired } from "./tokens";
import { checkFormatIsObject, checkFormatIsString, FormatChecker } from "../../../common/src/checkFormat";
import { requestHandlerBodyFormat, requestHandlerParamsFormat } from "./middlewares";

export default function requestsMountPosts(app: Express) {
    requestsPostsPost(app);
    requestsPostsPostReply(app);
    requestsPostsGetFromId(app);
    requestsPostsGetFromUserId(app);
    requestsPostsGetFromReplyId(app);
}

//
// Posts
//

const formatCheckerBodyPost: FormatChecker = checkFormatIsObject({
    content: checkFormatIsString
});

function requestsPostsPost(app: Express) {
    app.post("/posts",
        requestsMiddlewareTokensVerify(Models.formatCheckerUser),
        requestHandlerBodyFormat(formatCheckerBodyPost),
        (req: Request, res: Response) => {
            const user = req.tokenData as Models.User;
            const content = req.body.content;
            const post = databaseCreatePost(user.id, content);
            if (post === null) {
                res.sendStatus(403);
                return;
            }
            res.json(post);
        }
    );
}

const formatCheckerParamsReply: FormatChecker = checkFormatIsObject({
    id: checkFormatIsString
});

function requestsPostsPostReply(app: Express) {
    app.post("/posts/reply/:id",
        requestsMiddlewareTokensVerify(Models.formatCheckerUser),
        requestHandlerParamsFormat(formatCheckerParamsReply),
        requestHandlerBodyFormat(formatCheckerBodyPost),
        (req: Request, res: Response) => {
            const user = req.tokenData as Models.User;
            const replyId = req.params.id as string;
            const content = req.body.content as string;
            const post = databaseCreateReply(user.id, content, replyId);
            if (post === null) {
                res.sendStatus(404);
                return;
            }
            res.json(post);
        }
    );
}

//
// Gets
//

function requestsPostsGetFromId(app: Express) {
    app.get("/posts/id/:id", (req: Request, res: Response) => {
        const post: Models.Post | null = databaseGetPostFromPostId(req.params.id);
        if (post === null) {
            res.sendStatus(404);
            return;
        }
        res.json(post);
    });
}

function requestsPostsGetFromUserId(app: Express) {
    app.get("/posts/user/:userId",
        requestsMiddlewareTokensVerifyUnrequired(Models.formatCheckerUser),
        (req: Request, res: Response) => {
            const userId = req.params.userId;
            const requestingUser = req.tokenData as Models.User | undefined;

            const user = databaseGetUserFromUserId(userId);
            if (user === null) {
                res.sendStatus(404);
                return;
            }

            if (user.isPrivate) {
                if (requestingUser === undefined) {
                    res.sendStatus(403);
                    return;
                }
                const following = databaseCheckUserFollowers(userId, requestingUser.id);
                if (!following) {
                    res.sendStatus(403);
                    return;
                }
            }

            const posts: Models.Post[] | null = databaseGetPostsFromUserId(req.params.userId);
            if (posts === null) {
                res.sendStatus(404);
                return;
            }
            res.json(posts);
        }
    );
}

function requestsPostsGetFromReplyId(app: Express) {
    app.get("/posts/replies/:postId", (req: Request, res: Response) => {
        const replies: Models.Post[] | null = databaseGetRepliesFromPostId(req.params.postId);
        if (replies === null) {
            res.sendStatus(404);
            return;
        }
        res.json(replies);
    });
}
