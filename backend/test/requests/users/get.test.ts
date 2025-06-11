import { test, expect } from "@jest/globals";
import { Models } from "../../../../common/src/models";
import testJsonFetcher from "../requests";
import { loadTestData } from "../../data/testData";

const testData = loadTestData();

for (let i = 0; i < testData.users.length; i++) {
    test(`get user from id -- ${i}`, async () => {
        const userData = testData.users[i];
        const userRequest = await testJsonFetcher.get(`/users/id/${userData.id}`);
        expect(userRequest.status).toBe(200);

        const user = await userRequest.json() as Models.User;
        expect(user.id).toEqual(userData.id);
        expect(user.username).toEqual(userData.username);
        expect(user.isPrivate).toEqual(userData.isPrivate);
    });
}

test('get user from id, user does not exist', async () => {
    const userId = "null";
    const userRequest = await testJsonFetcher.get(`/users/id/${userId}`);
    expect(userRequest.status).toBe(404);
});

for (let i = 0; i < testData.users.length; i++) {
    test(`get user from username -- {i}`, async () => {
        const userData = testData.users[i];
        const userRequest = await testJsonFetcher.get(`/users/username/${userData.username}`);
        expect(userRequest.status).toBe(200);

        const user = await userRequest.json() as Models.User;
        expect(user.id).toEqual(userData.id);
        expect(user.username).toEqual(userData.username);
        expect(user.isPrivate).toEqual(userData.isPrivate);
    });
}
