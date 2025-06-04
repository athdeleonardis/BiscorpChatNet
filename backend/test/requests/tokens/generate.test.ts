import { expect, test } from "@jest/globals";
import testJsonFetcher from "../requests";

test('token post', async () => {
    const username = "andrew";
    const password = "password1";
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", {
        username: username,
        password: password
    });
    expect(tokenRequest.status).toBe(200);
});

test('token user does not exist', async () => {
    const username = "andy";
    const password = "password3";
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", {
        username: username,
        password: password
    });
    expect(tokenRequest.status).toBe(401);
});

test('token user incorrect password', async () => {
    const username = "andrew";
    const password = "passwordy";
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", {
        username: username,
        password: password
    });
    expect(tokenRequest.status).toBe(401);
});

test('token no username', async () => {
    const password = "password2";
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", {
        password: password
    });
    expect(tokenRequest.status).toBe(422);
});

test('token no password', async () => {
    const username = "amity";
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", {
        username: username
    });
    expect(tokenRequest.status).toBe(422);
});

test('token no body', async () => {
    const tokenRequest = await testJsonFetcher.post("/tokens/generate", undefined);
    expect(tokenRequest.status).toBe(422);
});
