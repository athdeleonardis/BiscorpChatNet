import Test from "../test";
import { postWrapper } from "./test-requests";

const test = new Test("Users Post");

const username = "TestUsername";
const password = "TestPassword1";
const userPostRequest = await postWrapper("/users", {
    username: username,
    password: password
});

test.assert(userPostRequest.status === 200, `Post request status -- ${userPostRequest.status}`);
test.success();
