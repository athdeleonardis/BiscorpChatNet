import { test, expect } from "@jest/globals";
import testJsonFetcher from "../requests";
import { loadTestData } from "../../data/testData";

const testData = loadTestData();

type TestParameters = {
    name: string,
    replyId: string,
    expectedStatus: number
};

const tests: TestParameters[] = [
    {
        name: "posts get replies non-existing",
        replyId: "null",
        expectedStatus: 404
    },
    {
        name: "posts get replies",
        replyId: testData.posts[0].id,
        expectedStatus: 200
    }
];

tests.forEach(testParameters => test(testParameters.name, async () => {
    const replyId = testParameters.replyId;
    const repliesRequest = await testJsonFetcher.get(`/posts/replies/${replyId}`);
    expect(repliesRequest.status).toBe(testParameters.expectedStatus);
}));
