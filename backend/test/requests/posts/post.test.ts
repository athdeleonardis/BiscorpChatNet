import { expect, test } from "@jest/globals";
import { Models } from "../../../../common/src/models";
import testJsonFetcher from "../requests";
import { loadTestData } from "../../data/testData";

const testData = loadTestData();

test('post create', async () => {
    const userId = testData.users[0].id;
    const username = testData.users[0].username;
    const password = testData.users[0].password;
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", { username, password });

    expect(tokenRequest.status).toBe(200);
    const token = await tokenRequest.json() as string;
    
    const content = "Test content 1";
    const postRequest = await testJsonFetcher.post("/posts", { content: content }, token);
    expect(postRequest.status).toBe(200);

    const post = await postRequest.json() as Models.Post;
    expect(Models.formatCheckerPost(post)).toBeTruthy();
    expect(post.userId).toEqual(userId);
    expect(post.content).toEqual(content);
});

test('post no token', async () => {
    const content = "Test content 2";
    const postRequest = await testJsonFetcher.post("/posts", { content: content });
    expect(postRequest.status).toBe(401);
});

test('post no content', async () => {
    const username = testData.users[0].username;
    const password = testData.users[0].password;
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", { username, password });
    expect(tokenRequest.status).toBe(200);

    const token = await tokenRequest.json() as string;
    const postRequest = await testJsonFetcher.post("/posts", { }, token);
    expect(postRequest.status).toBe(422);
});
