import { test, expect } from "@jest/globals";
import testJsonFetcher from "../requests";

test('user posted', async () => {
    const username = "TestUsernamePost1";
    const password = "TestPasswordPost1";
    const userPostRequest = await testJsonFetcher.post("/users", { username, password });
    expect(userPostRequest.status).toBe(200);
});

test('user no password', async () => {
    const username = "TestUsernamePost2";
    const userPostRequest = await testJsonFetcher.post("/users", { username });
    expect(userPostRequest.status).toBe(422);
});

test('user no username', async () => {
    const password = "TestPasswordPost3";
    const userPostRequest = await testJsonFetcher.post("/users", { password });
    expect(userPostRequest.status).toBe(422);
});

test('user no body', async () => {
    const userPostRequest = await testJsonFetcher.post("/users", undefined);
    expect(userPostRequest.status).toBe(422);
});
