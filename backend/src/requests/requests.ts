import { Express } from "express";
import requestsMountUsers from "./users";
import requestsMountTokens from "./tokens";
import requestsMountPosts from "./posts";
import requestsMountFollows from "./follows";

export default function requestsMount(app: Express) {
    requestsMountUsers(app);
    requestsMountTokens(app);
    requestsMountPosts(app);
    requestsMountFollows(app);
}
