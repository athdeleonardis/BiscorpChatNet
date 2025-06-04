import { expect, test } from "@jest/globals";
import { Models } from "../../../../common/src/models";
import testJsonFetcher from "../requests";

test('post create', async () => {
    const userId = "abcd";
    const username = "andrew";
    const password = "password1";
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", {
        username: username,
        password: password
    });
    expect(tokenRequest.status).toBe(200);
    const token = await tokenRequest.json() as string;
    
    const content = "hey hello hey";
    const postRequest = await testJsonFetcher.post("/posts", { content: content }, token);
    expect(postRequest.status).toBe(200);
    const post = await postRequest.json() as Models.Post;
    expect(Models.formatCheckerPost(post)).toBeTruthy();
    expect(post.userId).toEqual(userId);
    expect(post.content).toEqual(content);
});

test('post no token', async () => {
    const content = "hey hello hey";
    const postRequest = await testJsonFetcher.post("/posts", { content: content });
    expect(postRequest.status).toBe(401);
});

test('post no content', async () => {
    const username = "andrew";
    const password = "password1";
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", {
        username: username,
        password: password
    });
    expect(tokenRequest.status).toBe(200);
    const token = await tokenRequest.json() as string;

    const postRequest = await testJsonFetcher.post("/posts", { }, token);
    expect(postRequest.status).toBe(422);
});
