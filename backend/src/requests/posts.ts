import { Express, Request, Response } from "express";
import Database from "../database/database";
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
        async (req: Request, res: Response<Models.Post>) => {
            const user = req.tokenData as Models.User;
            const content = req.body.content;

            const postQueryResponse = await Database.queries().createPost(user.id, content);
            if (Database.onNonSuccess(res, 403, postQueryResponse))
                return;
            const post = Database.getData(postQueryResponse);
            
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
        async (req: Request, res: Response<Models.Post>) => {
            const user = req.tokenData as Models.User;
            const replyId = req.params.id as string;
            const content = req.body.content as string;

            const postQueryResponse = await Database.queries().createReply(user.id, replyId, content);
            if (Database.onNonSuccess(res, 404, postQueryResponse))
                return;
            const post = Database.getData(postQueryResponse);
            
            res.json(post);
        }
    );
}

//
// Gets
//

function requestsPostsGetFromId(app: Express) {
    app.get("/posts/id/:id",
        async (req: Request, res: Response<Models.Post>) => {
            const postId = req.params.id;

            const postQueryResponse = await Database.queries().getPost(postId);
            if (Database.onNonSuccess(res, 404, postQueryResponse))
                return;
            const post = Database.getData(postQueryResponse);
            
            res.json(post);
        }
    );
}

function requestsPostsGetFromUserId(app: Express) {
    app.get("/posts/user/:userId",
        requestsMiddlewareTokensVerifyUnrequired(Models.formatCheckerUser),
        async (req: Request, res: Response<Models.Post[]>) => {
            const userId = req.params.userId;
            const requestingUser = req.tokenData as Models.User | undefined;

            const userQueryResponse = await Database.queries().getUser(userId);
            if (Database.onNonSuccess(res, 404, userQueryResponse))
                return;
            const user = Database.getData(userQueryResponse);

            if (user.isPrivate) {
                if (requestingUser === undefined) {
                    res.sendStatus(403);
                    return;
                }

                if (user.id !== requestingUser.id) {
                    const isFollowingQueryResponse = await Database.queries().checkFollowers(userId, requestingUser.id);
                    if (Database.onNonSuccess(res, 404, isFollowingQueryResponse))
                        return;
                    const isFollowing = Database.getData(isFollowingQueryResponse);

                    if (!isFollowing) {
                        res.sendStatus(403);
                        return;
                    }
                }
            }

            const postsQueryResponse = await Database.queries().getUserPosts(userId);
            if (Database.onNonSuccess(res, 404, postsQueryResponse))
                return;
            const posts = Database.getData(postsQueryResponse);
            
            res.json(posts);
        }
    );
}

function requestsPostsGetFromReplyId(app: Express) {
    app.get("/posts/replies/:replyId",
        async (req: Request, res: Response<Models.Post[]>) => {
            const replyId = req.params.replyId;
            
            const repliesQueryResponse = await Database.queries().getPostReplies(replyId);
            if (Database.onNonSuccess(res, 404, repliesQueryResponse))
                return;
            const replies = Database.getData(repliesQueryResponse);

            res.json(replies);
        }
    );
}
