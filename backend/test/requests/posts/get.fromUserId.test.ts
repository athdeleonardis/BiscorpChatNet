import { test, expect } from "@jest/globals";
import testJsonFetcher from "../requests";
import { loadTestData } from "../../data/testData";

const testData = loadTestData();

type TestFormat = {
    name: string,
    userId: string,
    requestingUser?: { username: string, password: string },
    expectedStatus: number
}

const tests: TestFormat[] = [
    {
        name: 'user posts get non-existing user',
        userId: "null",
        expectedStatus: 404
    },
    {
        name: 'user posts get public user no token',
        userId: testData.users[0].id,
        expectedStatus: 200
    },
    {
        name: 'user posts get public user with token',
        userId: testData.users[0].id,
        requestingUser: {
            username: testData.users[1].username,
            password: testData.users[1].password
        },
        expectedStatus: 200
    },
    {
        name: 'user posts get private user no token',
        userId: testData.users[1].id,
        expectedStatus: 403
    },
    {
        name: 'user posts get private user with token and following',
        userId: testData.users[1].id,
        requestingUser: {
            username: testData.users[0].username,
            password: testData.users[0].password
        },
        expectedStatus: 200
    },
    {
        name: 'user posts get private user with token not following',
        userId: testData.users[1].id,
        requestingUser: {
            username: testData.users[2].username,
            password: testData.users[2].password
        },
        expectedStatus: 403
    },
    {
        name: 'user posts get private user from self',
        userId: testData.users[1].id,
        requestingUser: {
            username: testData.users[1].username,
            password: testData.users[1].password
        },
        expectedStatus: 200
    }
];

tests.forEach(testParameters => test(testParameters.name, async () => {
    const requestingUser = testParameters.requestingUser;
    let token: string | undefined = undefined;
    if (requestingUser) {
        const tokenRequest = await testJsonFetcher.post("/tokens/generate", requestingUser);
        expect(tokenRequest.status).toBe(200);
        token = await tokenRequest.json() as string;
    }

    const userId = testParameters.userId;
    const postsRequest = await testJsonFetcher.get(`/posts/user/${userId}`, token);
    expect(postsRequest.status).toBe(testParameters.expectedStatus);
}));
