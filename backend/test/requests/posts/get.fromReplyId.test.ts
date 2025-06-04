import { test, expect } from "@jest/globals";
import testJsonFetcher from "../requests";

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
        replyId: "abcde",
        expectedStatus: 200
    }
];

tests.forEach(testParameters => test(testParameters.name, async () => {
    const replyId = testParameters.replyId;
    const repliesRequest = await testJsonFetcher.get(`/posts/replies/${replyId}`);
    expect(repliesRequest.status).toBe(testParameters.expectedStatus);
}));
