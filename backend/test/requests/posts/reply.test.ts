import { test, expect } from "@jest/globals";
import { Models } from "../../../../common/src/models";
import testJsonFetcher from "../requests";
import { loadTestData } from "../../data/testData";

const testData = loadTestData();

test('reply create', async () => {
    const userId = testData.users[0].id;
    const username = testData.users[0].username;
    const password = testData.users[0].password;
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", { username, password });
    expect(tokenRequest.status).toBe(200);

    const token = await tokenRequest.json() as string;
    const replyId = testData.posts[0].id;
    const content = "Test reply 1";
    const replyRequest = await testJsonFetcher.post(`/posts/reply/${replyId}`, { content }, token);
    expect(replyRequest.status).toBe(200);

    const reply = await replyRequest.json() as Models.Post;
    expect(Models.formatCheckerReply(reply)).toBeTruthy();
    expect(reply.userId).toEqual(userId);
    expect(reply.content).toEqual(content);
    expect(reply.replyId).toEqual(replyId);
});

test('reply no token', async () => {
    const replyId = testData.posts[0].id;
    const content = "Test reply 2";
    const replyRequest = await testJsonFetcher.post(`/posts/reply/${replyId}`, { content: content });
    expect(replyRequest.status).toBe(401);
});

test('reply no content', async () => {
    const username = testData.users[0].username;
    const password = testData.users[0].password;
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", { username, password });
    expect(tokenRequest.status).toBe(200);

    const token = await tokenRequest.json() as string;
    const replyId = testData.posts[0].id;
    const replyRequest = await testJsonFetcher.post(`/posts/reply/${replyId}`, { }, token);
    expect(replyRequest.status).toBe(422);
});

test('reply no replyId', async () => {
    const username = testData.users[0].username;
    const password = testData.users[0].password;
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", { username, password });
    expect(tokenRequest.status).toBe(200);

    const token = await tokenRequest.json() as string;
    const replyId = "___";
    const content = "Test reply 3";
    const replyRequest = await testJsonFetcher.post(`/posts/reply/${replyId}`, { content: content }, token);
    expect(replyRequest.status).toBe(404);
});
