import { Express } from "express";
import requestsMountUsers from "./users";
import requestsMountTokens from "./tokens";
import requestsMountPosts from "./posts";
import requestsMountFollowers from "./followers";

export default function requestsMount(app: Express) {
    requestsMountUsers(app);
    requestsMountTokens(app);
    requestsMountPosts(app);
    requestsMountFollowers(app);
}
