import { test, expect } from "@jest/globals";
import JSONFetcher from "../../../../common/src/jsonFetcher";

const jsonFetcher = new JSONFetcher("http://localhost:4000");

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
    const repliesRequest = await jsonFetcher.get(`/posts/replies/${replyId}`);
    expect(repliesRequest.status).toBe(testParameters.expectedStatus);
}));
