import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"

import { PostFrontend, UserFrontend, databaseCreateUser, databaseCreateReply, databaseGetPostFromPostId, databaseCreatePost, databaseGetPostsFromUserId, databaseGetRepliesFromPostId, databaseGetUserFromUserId, databaseGetUserFromUsername, databaseGetUserFollowers, databaseCreateFollow } from "./database.js"

dotenv.config();
const port = process.env.PORT || 3000;

const app: Express = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

//
// Users
//

app.post("/users", (req: Request, res: Response) => {
    const username = req.body.username;
    const password = req.body.password;
    if (typeof username !== "string") {
        res.sendStatus(403);
        return;
    }
    if (typeof password !== "string") {
        res.sendStatus(403);
        return;
    }
    const user: UserFrontend | null = databaseCreateUser(username, password);
    if (user === null) {
        res.sendStatus(403);
        return;
    }
    res.json(user);
});

app.get("/users/id/:id", (req: Request, res: Response) => {
    const user: UserFrontend | null = databaseGetUserFromUserId(req.params.id);
    if (user === null) {
        res.sendStatus(404);
        return;
    }
    res.json(user);
});

app.get("/users/username/:username", (req: Request, res: Response) => {
    const user: UserFrontend | null = databaseGetUserFromUsername(req.params.username);
    if (user === null) {
        res.sendStatus(404);
        return;
    }
    res.json(user);
});

//
// Posts
//

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

app.get("/posts/id/:id", (req: Request, res: Response) => {
    const post: PostFrontend | null = databaseGetPostFromPostId(req.params.id);
    if (post === null) {
        res.sendStatus(404);
        return;
    }
    res.json(post);
});

app.get("/posts/user/:userId", (req: Request, res: Response) => {
    const posts: PostFrontend[] | null = databaseGetPostsFromUserId(req.params.userId);
    if (posts === null) {
        res.sendStatus(404);
        return;
    }
    res.json(posts);
});

app.get("/posts/replies/:postId", (req: Request, res: Response) => {
    const replies: PostFrontend[] | null = databaseGetRepliesFromPostId(req.params.postId);
    if (replies === null) {
        res.sendStatus(404);
        return;
    }
    res.json(replies);
});

//
// Follows
//

app.post("/followers/:userId", (req: Request, res: Response) => {
    const followingId = req.body.followingId;
    if (typeof followingId !== "string") {
        res.sendStatus(403);
        return;
    }
    const newFollow: boolean | null = databaseCreateFollow(req.params.userId, followingId);
    if (newFollow === null) {
        res.sendStatus(404);
        return;
    }
    if (newFollow === false) {
        res.sendStatus(200);
        return;
    }
    res.sendStatus(201);
});

app.get("/followers/:userId", (req: Request, res: Response) => {
    const followers: string[] | null = databaseGetUserFollowers(req.params.userId);
    if (followers === null) {
        res.sendStatus(404);
        return;
    }
    res.json(followers);
});

//
// Startup
//

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
