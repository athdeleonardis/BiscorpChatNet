import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const test_data_file_path = process.env.TEST_DATA as string;

type TestUserSerialized = {
    id: number,
    username: string,
    password: string,
    isPrivate: boolean
};

type TestPostSerialized = {
    id: number,
    userId: number,
    replyId: number | null,
    content: string,
};

type TestFollowerSerialized = {
    userId: number
    followerId: number,
};

type TestUser = {
    id: string,
    username: string,
    password: string,
    isPrivate: boolean
};

type TestPost = {
    id: string,
    userId: string,
    replyId: string | null,
    content: string
};

type TestFollower = {
    userId: string,
    followerId: string
};

const users: TestUserSerialized[] = [
    {
        id: 0,
        username: "TestUser1",
        password: "TestPassword1",
        isPrivate: false
    },
    {
        id: 1,
        username: "TestUser2",
        password: "TestPassword2",
        isPrivate: true
    },
    {
        id: 2,
        username: "TestUser3",
        password: "TestPassword3",
        isPrivate: false
    }
];

const posts: TestPostSerialized[] = [
    {
        id: 0,
        userId: 0,
        replyId: null,
        content: "Test post 1",
    },
    {
        id: 1,
        userId: 1,
        replyId: 0,
        content: "Test post 2 (reply)"
    }
];

const followers: TestFollowerSerialized[] = [
    {
        userId: 1,
        followerId: 0
    },
    {
        userId: 0,
        followerId: 1
    }
];

type TestDataSerialized = {
    users: TestUserSerialized[],
    posts: TestPostSerialized[],
    followers: TestFollowerSerialized[]
};

export const testDataSerialized: TestDataSerialized = {
    users,
    posts,
    followers
};

type TestData = {
    users: TestUser[],
    posts: TestPost[],
    followers: TestFollower[]
};

export const testData: TestData = {
    users: [],
    posts: [],
    followers: []
};

export function saveTestData(testData: TestData) {
    const data = JSON.stringify(testData, null, 4);
    fs.writeFileSync(test_data_file_path, data);
}

export function loadTestData(): TestData {
    const data = fs.readFileSync(test_data_file_path, "utf8");
    return JSON.parse(data) as TestData;
}
