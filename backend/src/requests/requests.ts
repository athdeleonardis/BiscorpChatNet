import { Express } from "express";
import requestsMountUsers from "./users";
import requestsMountPosts from "./posts";
import requestsMountFollows from "./follows";

export default function requestsMount(app: Express) {
    requestsMountUsers(app);
    requestsMountPosts(app);
    requestsMountFollows(app);
}
