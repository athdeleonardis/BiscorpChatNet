import { Express, Request, Response } from "express";
import { databaseCreateFollow, databaseGetUserFollowers } from "../database";

export default function requestsMountFollows(app: Express) {
    requestsFollowsPost(app);
    requestsFollowsGetFromUserId(app);
}

function requestsFollowsPost(app: Express) {
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
}

function requestsFollowsGetFromUserId(app: Express) {
    app.get("/followers/:userId", (req: Request, res: Response) => {
        const followers: string[] | null = databaseGetUserFollowers(req.params.userId);
        if (followers === null) {
            res.sendStatus(404);
            return;
        }
        res.json(followers);
    });
}
