import { Models } from "../../../common/src/models";
import Database from "../../src/database/database";
import databaseInterface from "../../src/database/interfaces/mongodbInterface";
import { testWrapperInterface } from "../../src/database/interfaces/testWrapperInterface";
import { mongodbClient } from "../../src/database/interfaces/mongodbInterface";
import { testDataSerialized, testData } from "./testData";
import fs from "fs";

Database.setInterface(testWrapperInterface(databaseInterface));

Database.queries().connect().then(async (connectionResponse) => {
    console.log("[mongodb] Connecting...");
    if (connectionResponse.status !== Database.ResponseType.Success) {
        throw new Error("Failed to connect to database.");
    }
    
    console.log("[mongodb] Recreating collections...");
    const database = mongodbClient.db("test");
    await database.dropCollection("users");
    await database.dropCollection("posts");
    await database.dropCollection("followers");
    await database.createCollection("users");
    await database.createCollection("posts");
    await database.createCollection("followers");

    console.log("[mongodb] Inserting users...");
    const userPromises = testDataSerialized.users.map(userData => Database.queries().createUser(userData.username, userData.password));
    const userResponses = await Promise.all(userPromises);
    for (let userResponse of userResponses) {
        if (userResponse.status !== Database.ResponseType.Success) {
            throw new Error("Failed to create user");
        }
    }
    testData.users = userResponses.map(Database.getData).map((user, i) => {
        const _user = user as any;
        _user.password = testDataSerialized.users[i].password;
        return _user;
    });
    for (let i = 0; i < testDataSerialized.users.length; i++) {
        if (testDataSerialized.users[i].isPrivate) {
            const privacyResponse = await Database.queries().setUserPrivacy(testData.users[i].id, true);
            if (privacyResponse.status !== Database.ResponseType.Success)
                throw new Error("Failed to set user privacy");
            testData.users[i].isPrivate = true;
        }
    }

    console.log("[mongodb] Inserting followers...");
    const followerPromises = testDataSerialized.followers.map(followerData => Database.queries().createFollower(testData.users[followerData.userId].id, testData.users[followerData.followerId].id));
    const followerResponses = await Promise.all(followerPromises);
    for (let followerResponse of followerResponses) {
        if (followerResponse.status !== Database.ResponseType.Success) {
            throw new Error("Failed to create follower.");
        }
    }
    testData.followers = followerResponses.map(response => Database.getData(response));

    console.log("[mongodb] Inserting posts...");
    testData.posts = [];
    for (let postData of testDataSerialized.posts) {
        let postResponse: Database.Response<Models.Post>;
        if (postData.replyId !== null) {
            postResponse = await Database.queries().createReply(
                testData.users[postData.userId].id,
                testData.posts[postData.replyId].id,
                postData.content
            );
        }
        else {
            postResponse = await Database.queries().createPost(
                testData.users[postData.userId].id,
                postData.content
            );
        }
        if (postResponse.status !== Database.ResponseType.Success) {
            throw new Error("Failed to create post.");
        }
        testData.posts.push(postResponse.data);
    }

    console.log("Saving test data to '.testdata.json'");
    fs.writeFileSync('.testdata.json', JSON.stringify(testData, null, 4));
    
    console.log("Exiting...");
    process.exit(0);
});
