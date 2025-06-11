import { test, expect } from "@jest/globals";
import { checkFormatIsArray } from "../../../../common/src/checkFormat";
import { Models } from "../../../../common/src/models";
import testJsonFetcher from "../requests";
import { loadTestData } from "../../data/testData";

const testData = loadTestData();

type TestFormat = {
    name: string
    userId: string,
    requestingUser?: { username: string, password: string},
    expectedStatus: number
};

const formatCheckerUsersArray = checkFormatIsArray(Models.formatCheckerUser);

const tests: TestFormat[] = [
    {
        name: 'followers get non-existing user',
        userId: "null",
        expectedStatus: 404
    },
    {
        name: 'followers get public user no token',
        userId: testData.users[0].id,
        expectedStatus: 200
    },
    {
        name: 'followers get public user with token',
        userId: testData.users[0].id,
        requestingUser: {
            username: testData.users[1].username,
            password: testData.users[1].password
        },
        expectedStatus: 200
    },
    {
        name: 'followers get private user no token',
        userId: testData.users[1].id,
        expectedStatus: 403
    },
    {
        name: 'followers get private user with token and following',
        userId: testData.users[1].id,
        requestingUser: {
            username: testData.users[0].username,
            password: testData.users[0].password
        },
        expectedStatus: 200
    },
    {
        name: 'followers get private user with token not following',
        userId: testData.users[1].id,
        requestingUser: {
            username: testData.users[2].username,
            password: testData.users[2].password
        },
        expectedStatus: 403
    },
    {
        name: 'followers get private user from self',
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
        token = await tokenRequest.json();
    }

    const userId = testParameters.userId;
    const followersRequest = await testJsonFetcher.get(`/followers/${userId}`, token);
    expect(followersRequest.status).toBe(testParameters.expectedStatus);
    if (testParameters.expectedStatus === 200) {
        const followers = await followersRequest.json();
        expect(formatCheckerUsersArray(followers)).toBeTruthy();
    }
}));
