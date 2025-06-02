import { test, expect } from "@jest/globals";
import JSONFetcher from "../../../../common/src/jsonFetcher";
import { Models } from "../../../../common/src/models";

const jsonFetcher = new JSONFetcher("http://localhost:4000");

test('get user from id', async () => {
    const userId = "abcd";
    const username = "andrew";
    const userRequest = await jsonFetcher.get(`/users/id/${userId}`);
    expect(userRequest.status).toBe(200);

    const user = await userRequest.json() as Models.User;
    expect(user.id).toEqual(userId);
    expect(user.username).toEqual(username);
    expect(user.isPrivate).toBe(false);
});

test('get user from id, user does not exist', async () => {
    const userId = "null";
    const userRequest = await jsonFetcher.get(`/users/id/${userId}`);
    expect(userRequest.status).toBe(404);
})

test('get user from username', async () => {
    const userId = "abcd";
    const username = "andrew";
    const userRequest = await jsonFetcher.get(`/users/username/${username}`);
    expect(userRequest.status).toBe(200);

    const user = await userRequest.json() as Models.User;
    expect(user.id).toEqual(userId);
    expect(user.username).toEqual(username);
    expect(user.isPrivate).toEqual(false);
});

test('get user from username, user does not exist', async () => {
    const username = "null";
    const userRequest = await jsonFetcher.get(`/users/username/${username}`);
    expect(userRequest.status).toBe(404);
});
