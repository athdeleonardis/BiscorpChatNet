import { test, expect } from "@jest/globals";
import testJsonFetcher from "../requests";
import { loadTestData } from "../../data/testData";

const testData = loadTestData();

type TestFormat = {
    name: string,
    postId: string,
    expectedStatus: number
}

const tests: TestFormat[] = [
    {
        name: 'post get non-existing',
        postId: "null",
        expectedStatus: 404
    },
    {
        name: 'post get',
        postId: testData.posts[0].id,
        expectedStatus: 200
    }
];

tests.forEach(testParameters => test(testParameters.name, async () => {
    const postId = testParameters.postId;
    const postRequest = await testJsonFetcher.get(`/posts/id/${postId}`);
    expect(postRequest.status).toBe(testParameters.expectedStatus);
}));
