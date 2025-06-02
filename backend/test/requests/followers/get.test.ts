import { test, expect } from "@jest/globals";
import JSONFetcher from "../../../../common/src/jsonFetcher";

const jsonFetcher = new JSONFetcher("http://localhost:4000");

type TestFormat = {
    name: string
    userId: string,
    requestingUser?: { username: string, password: string},
    expectedStatus: number
};

const tests: TestFormat[] = [
    {
        name: 'followers get non-existing user',
        userId: "null",
        expectedStatus: 404
    },
    {
        name: 'followers get public user no token',
        userId: "abcd",
        expectedStatus: 200
    },
    {
        name: 'followers get public user with token',
        userId: "abcd",
        requestingUser: {
            username: "amity",
            password: "password2"
        },
        expectedStatus: 200
    },
    {
        name: 'followers get private user no token',
        userId: "abc",
        expectedStatus: 403
    },
    {
        name: 'followers get private user with token and following',
        userId: "abc",
        requestingUser: {
            username: "andrew",
            password: "password1"
        },
        expectedStatus: 200
    },
    {
        name: 'followers get private user with token not following',
        userId: "abc",
        requestingUser: {
            username: "stephen",
            password: "password_stephen"
        },
        expectedStatus: 403
    },
    {
        name: 'followers get private user from self',
        userId: "abc",
        requestingUser: {
            username: "amity",
            password: "password2"
        },
        expectedStatus: 200
    }
];

tests.forEach(testParameters => test(testParameters.name, async () => {
    const requestingUser = testParameters.requestingUser;
    let token: string | undefined = undefined;
    if (requestingUser) {
        const tokenRequest = await jsonFetcher.post("/tokens/generate", requestingUser);
        expect(tokenRequest.status).toBe(200);
        token = await tokenRequest.json();
    }

    const userId = testParameters.userId;
    const followersRequest = await jsonFetcher.get(`/followers/${userId}`, token);
    expect(followersRequest.status).toBe(testParameters.expectedStatus);
}));
