import { expect, test } from "@jest/globals";
import JSONFetcher from "../../../../common/src/jsonFetcher";

const jsonFetcher = new JSONFetcher("http://localhost:4000");

test('token post', async () => {
    const username = "andrew";
    const password = "password1";
    const tokenRequest = await jsonFetcher.post("/tokens/generate", {
        username: username,
        password: password
    });
    expect(tokenRequest.status).toBe(200);
});

test('token user does not exist', async () => {
    const username = "andy";
    const password = "password3";
    const tokenRequest = await jsonFetcher.post("/tokens/generate", {
        username: username,
        password: password
    });
    expect(tokenRequest.status).toBe(401);
});

test('token user incorrect password', async () => {
    const username = "andrew";
    const password = "passwordy";
    const tokenRequest = await jsonFetcher.post("/tokens/generate", {
        username: username,
        password: password
    });
    expect(tokenRequest.status).toBe(401);
});

test('token no username', async () => {
    const password = "password2";
    const tokenRequest = await jsonFetcher.post("/tokens/generate", {
        password: password
    });
    expect(tokenRequest.status).toBe(422);
});

test('token no password', async () => {
    const username = "amity";
    const tokenRequest = await jsonFetcher.post("/tokens/generate", {
        username: username
    });
    expect(tokenRequest.status).toBe(422);
});

test('token no body', async () => {
    const tokenRequest = await jsonFetcher.post("/tokens/generate", undefined);
    expect(tokenRequest.status).toBe(422);
});
