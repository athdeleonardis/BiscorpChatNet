import { test, expect } from "@jest/globals";
import JSONFetcher from "../../../common/src/jsonFetcher";

const jsonFetcher = new JSONFetcher("http://localhost:4000");

test('user posted', async () => {
    const username = "TestUsername0";
    const password = "TestPassword0";
    const userPostRequest = await jsonFetcher.post("/users", {
        username: username,
        password: password
    });
    expect(userPostRequest.status).toBe(200);
});

test('user no password', async () => {
    const username = "TestUsername1";
    const userPostRequest = await jsonFetcher.post("/users", {
        username: username
    });
    expect(userPostRequest.status).toBe(400);
});

test('user no username', async () => {
    const password = "TestPassword2";
    const userPostRequest = await jsonFetcher.post("/users", {
        password: password
    });
    expect(userPostRequest.status).toBe(400);
});

test('user no body', async () => {
    const userPostRequest = await jsonFetcher.post("/users", undefined);
    expect(userPostRequest.status).toBe(400);
});
