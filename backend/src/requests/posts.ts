import { Express, Request, Response } from "express";
import { databaseCreatePost, databaseCreateReply, databaseGetPostFromPostId, databaseGetPostsFromUserId, databaseGetRepliesFromPostId } from "../database";
import { PostFrontend } from "../database";

export default function requestsMountPosts(app: Express) {
    requestsPostsPost(app);
    requestsPostsPostReply(app);
    requestsPostsGetFromId(app);
    requestsPostsGetFromUserId(app);
    requestsPostsGetFromReplyId(app);
}

function requestsPostsPost(app: Express) {
    app.post("/posts", (req: Request, res: Response) => {
        // TODO: User ID to come from token
        const userId = req.body.userId;
        const content = req.body.content;
        if (typeof userId !== "string" || typeof content !== "string") {
            res.sendStatus(403);
            return;
        }
        const post = databaseCreatePost(userId, content);
        if (post === null) {
            res.sendStatus(403);
            return;
        }
        res.json(post);
    });
}

function requestsPostsPostReply(app: Express) {
    app.post("/posts/reply/:id", (req: Request, res: Response) => {
        // TODO: User ID to come from token
        const userId = req.body.userId;
        const content = req.body.content;
        const replyId = req.params.id;
        if (typeof userId !== "string") {
            res.sendStatus(403);
            return;
        }
        if (typeof content !== "string") {
            res.sendStatus(403);
            return;
        }
        const post = databaseCreateReply(userId, content, replyId);
        if (post === null) {
            res.sendStatus(404);
            return;
        }
    });
}

function requestsPostsGetFromId(app: Express) {
    app.get("/posts/id/:id", (req: Request, res: Response) => {
        const post: PostFrontend | null = databaseGetPostFromPostId(req.params.id);
        if (post === null) {
            res.sendStatus(404);
            return;
        }
        res.json(post);
    });
}

function requestsPostsGetFromUserId(app: Express) {
    app.get("/posts/user/:userId", (req: Request, res: Response) => {
        const posts: PostFrontend[] | null = databaseGetPostsFromUserId(req.params.userId);
        if (posts === null) {
            res.sendStatus(404);
            return;
        }
        res.json(posts);
    });
}

function requestsPostsGetFromReplyId(app: Express) {
    app.get("/posts/replies/:postId", (req: Request, res: Response) => {
        const replies: PostFrontend[] | null = databaseGetRepliesFromPostId(req.params.postId);
        if (replies === null) {
            res.sendStatus(404);
            return;
        }
        res.json(replies);
    });
}
