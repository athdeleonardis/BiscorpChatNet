import { test, expect } from "@jest/globals";
import { Models } from "../../../../common/src/models";
import JSONFetcher from "../../../../common/src/jsonFetcher";

const jsonFetcher = new JSONFetcher("http://localhost:4000");

test('reply create', async () => {
    const userId = "abcd";
    const username = "andrew";
    const password = "password1";
    const tokenRequest = await jsonFetcher.post("/tokens/generate", {
        username: username,
        password: password
    });
    expect(tokenRequest.status).toBe(200);
    const token = await tokenRequest.json() as string;

    const replyId = "abcde";
    const content = "hey hi hey hey";
    const replyRequest = await jsonFetcher.post(`/posts/reply/${replyId}`, { content: content }, token);
    expect(replyRequest.status).toBe(200);

    const reply = await replyRequest.json() as Models.Post;
    expect(Models.formatCheckerReply(reply)).toBeTruthy();
    expect(reply.userId).toEqual(userId);
    expect(reply.content).toEqual(content);
    expect(reply.replyId).toEqual(replyId);
});

test('reply no token', async () => {
    const replyId = "abcde";
    const content = "hey hi hey hey";
    const replyRequest = await jsonFetcher.post(`/posts/reply/${replyId}`, { content: content });
    expect(replyRequest.status).toBe(401);
});

test('reply no content', async () => {
    const username = "andrew";
    const password = "password1";
    const tokenRequest = await jsonFetcher.post("/tokens/generate", {
        username: username,
        password: password
    });
    expect(tokenRequest.status).toBe(200);
    const token = await tokenRequest.json() as string;
    
    const replyId = "abcde";
    const replyRequest = await jsonFetcher.post(`/posts/reply/${replyId}`, { }, token);
    expect(replyRequest.status).toBe(422);
});

test('reply no replyId', async () => {
    const username = "andrew";
    const password = "password1";
    const tokenRequest = await jsonFetcher.post("/tokens/generate", {
        username: username,
        password: password
    });
    expect(tokenRequest.status).toBe(200);
    const token = await tokenRequest.json() as string;

    const replyId = "___";
    const content = "reply no replyId";
    const replyRequest = await jsonFetcher.post(`/posts/reply/${replyId}`, { content: content }, token);
    expect(replyRequest.status).toBe(404);
});
