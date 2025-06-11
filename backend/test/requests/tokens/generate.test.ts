import { expect, test } from "@jest/globals";
import testJsonFetcher from "../requests";
import { loadTestData } from "../../data/testData";

const testData = loadTestData();

test('token post', async () => {
    const username = testData.users[0].username;
    const password = testData.users[0].password;
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", { username: username, password: password });
    expect(tokenRequest.status).toBe(200);
});

test('token user does not exist', async () => {
    const username = "TestUser0";
    const password = "TestPassword0";
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", { username, password });
    expect(tokenRequest.status).toBe(401);
});

test('token user incorrect password', async () => {
    const username = testData.users[0].username;
    const password = "TestPassword0";
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", { username, password });
    expect(tokenRequest.status).toBe(401);
});

test('token no username', async () => {
    const password = testData.users[0].password;
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", { password });
    expect(tokenRequest.status).toBe(422);
});

test('token no password', async () => {
    const username = testData.users[0].username;
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", { username });
    expect(tokenRequest.status).toBe(422);
});

test('token no body', async () => {
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", undefined);
    expect(tokenRequest.status).toBe(422);
});
