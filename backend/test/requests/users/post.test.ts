import { test, expect } from "@jest/globals";
import testJsonFetcher from "../requests";

test('user posted', async () => {
    const username = "TestUsername0";
    const password = "TestPassword0";
    const userPostRequest = await testJsonFetcher.post("/users", {
        username: username,
        password: password
    });
    expect(userPostRequest.status).toBe(200);
});

test('user no password', async () => {
    const username = "TestUsername1";
    const userPostRequest = await testJsonFetcher.post("/users", {
        username: username
    });
    expect(userPostRequest.status).toBe(422);
});

test('user no username', async () => {
    const password = "TestPassword2";
    const userPostRequest = await testJsonFetcher.post("/users", {
        password: password
    });
    expect(userPostRequest.status).toBe(422);
});

test('user no body', async () => {
    const userPostRequest = await testJsonFetcher.post("/users", undefined);
    expect(userPostRequest.status).toBe(422);
});
