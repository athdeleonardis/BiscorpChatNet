import dotenv from "dotenv";
import Database from "../database";
import { Collection, MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { Models } from "../../../../common/src/models";
import { checkFormatAnyOf, checkFormatIs, checkFormatIsArray, checkFormatIsBoolean, checkFormatIsObject, checkFormatIsString, FormatChecker } from "../../../../common/src/checkFormat";
import { passwordHashGenerate, passwordHashVerify } from "../../security/password";

//
// Initialize constants
//

dotenv.config();
const database_username = process.env.MONGODB_USERNAME as string;
const database_password = process.env.MONGODB_PASSWORD as string;
const database_url = process.env.MONGODB_URL as string;
const database_cluster = process.env.MONGODB_CLUSTER as string;

const database_uri = `mongodb+srv://${database_username}:${database_password}@${database_url}/?retryWrites=true&w=majority&appName=${database_cluster}`;

export const mongodbClient = new MongoClient(database_uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

const database = mongodbClient.db("test");
const users = () => database.collection("users");
const posts = database.collection("posts");
const followers = database.collection("followers");

//
// Initialize database response type checking
//

function objectId(id: string): ObjectId | null {
    try {
        return new ObjectId(id);
    } catch (_) {
        return null;
    }
}

function formatCheckerMongodbObjectId(input: any): boolean {
    return input instanceof ObjectId;
}

const formatCheckerUserDatabase = checkFormatIsObject({
    _id: formatCheckerMongodbObjectId,
    username: checkFormatIsString,
    password: checkFormatIsString,
    isPrivate: checkFormatIsBoolean
});

function userReformatter(input: any): Models.User {
    return {
        id: input._id.toString(),
        username: input.username,
        isPrivate: input.isPrivate
    };
}

const formatCheckerPostDatabase = checkFormatIsObject({
    _id: formatCheckerMongodbObjectId,
    userId: formatCheckerMongodbObjectId,
    replyId: checkFormatAnyOf([checkFormatIs(null), formatCheckerMongodbObjectId]),
    content: checkFormatIsString
});

function postReformatter(input: any): Models.Post {
    const replyId = (input.replyId === null) ? null : input.replyId.toString();
    return {
        id: input._id.toString(),
        userId: input.userId.toString(),
        replyId,
        content: input.content
    };
}

const formatCheckerFollowerDatabase = checkFormatIsObject({
    userId: formatCheckerMongodbObjectId,
    followerId: formatCheckerMongodbObjectId
});

function followerReformatter(input: any): Models.Follower {
    return {
        userId: input.userId.toString(),
        followerId: input.followerId.toString()
    };
}

//
// Initialize database interface
//

const databaseInterface: Database.Interface = {
    // Connections
    connect: connect,
    disconnect: disconnect,
    // Users
    createUser: createUser,
    getUser: getUser,
    getUserFromUsername: getUserFromUsername,
    getUserFromUsernameAndPassword: getUserByUsernameAndPassword,
    setUserPrivacy: setUserPrivacy,
    // Posts
    createPost: createPost,
    createReply: createReply,
    getPost: getPost,
    getPostReplies: getPostReplies,
    getUserPosts: getUserPosts,
    // Followers
    createFollower: createFollower,
    getUserFollowers: getUserFollowers,
    checkFollowers: checkFollowers,
};
export default databaseInterface;

//
// Connections
//

function connect(): Promise<Database.Response<null>> {
    return mongodbClient.connect()
        .then(() => Database.success(null))
        .catch((error) => Database.failure(error));
}

function disconnect(): Promise<Database.Response<null>> {
    return mongodbClient.close().then(() => Database.success(null));
}

function findOne<T>(collection: Collection, query: any, formatChecker: FormatChecker, reformatter: (input: any) => T): Promise<Database.Response<T>> {
    return collection.findOne(query)
        .then((data) => {
            if (data === null)
                return Database.unallowed<T>()
            if (!formatChecker(data))
                throw new Error("Find one response bad format");
            const dataFrontend = reformatter(data);
            return Database.success(dataFrontend);
        })
        .catch((error) => Database.failure(error));
}

function findMany<T>(collection: Collection, query: any, formatChecker: FormatChecker, reformatter: (input: any) => T): Promise<Database.Response<T[]>> {
    return collection.find(query).toArray()
        .then(data => {
            const arrayFormatChecker = checkFormatIsArray(formatChecker);
            if (!arrayFormatChecker(data))
                throw new Error("Find many response bad format");
            const dataFrontend = data.map(reformatter);
            return Database.success(dataFrontend);
        })
        .catch(error => {
            return Database.failure(error);
        });
}

function insertOne<T>(collection: Collection, query: any): Promise<Database.Response<string>> {
    return collection.insertOne(query)
        .then(data => Database.success(data.insertedId.toString()))
        .catch(error => Database.failure(error));
}

function updateOne<T>(collection: Collection, query: any, update: any, formatChecker: FormatChecker): Promise<Database.Response<null>> {
    return collection.findOneAndUpdate(query, { "$set": update })
        .then(data => {
            if (data === null)
                return Database.unallowed<null>();
            if (!formatChecker(data))
                throw new Error("Update one failed to verify format");
            return Database.success(null);
        })
        .catch(error => Database.failure(error));
}

//
// Users
//

function getUser(userId: string): Promise<Database.Response<Models.User>> {
    const _id = objectId(userId);
    if (_id === null)
        return Promise.resolve(Database.unallowed());
    return findOne(users(), { _id }, formatCheckerUserDatabase, userReformatter);
}

function getUserFromUsername(username: string): Promise<Database.Response<Models.User>> {
    return findOne(users(), { username: username }, formatCheckerUserDatabase, userReformatter);
}

function createUser(username: string, password: string): Promise<Database.Response<Models.User>> {
    return passwordHashGenerate(password)
        .then(passwordHash => {
            return getUserFromUsername(username)
                .then(Database.ifUnallowed(() => insertOne(users(), { username, password: passwordHash, isPrivate: false })))
                .then(Database.ifSuccess(id => {
                    const user: Models.User = { id, username, isPrivate: false };
                    return Database.success(user);
                }));
        })
        .catch((error) => Database.failure(error));
}

function getUserByUsernameAndPassword(username: string, password: string): Promise<Database.Response<Models.User>> {
    return users().findOne({ username })
        .then((data) => {
            if (data === null)
                return Database.unallowed<Models.User>();

            if (!formatCheckerUserDatabase(data))
                new Error("getUserByUsernameAndPassword - failed to verify user format.");
            
            return passwordHashVerify(password, data.password)
                .then((verified) => {
                    if (!verified)
                        return Database.unallowed<Models.User>();
                    const dataFrontend = userReformatter(data);
                    return Database.success(dataFrontend);
                })
                .catch((error) => Database.failure<Models.User>(error));
        })
        .catch((error) => Database.failure<Models.User>(error));
}

function setUserPrivacy(userId: string, isPrivate: boolean): Promise<Database.Response<null>> {
    const _id = objectId(userId);
    if (_id === null)
        return Promise.resolve(Database.unallowed());
    return updateOne(users(), { _id }, { isPrivate }, formatCheckerUserDatabase);
}

//
// Posts
//

function getPost(postId: string): Promise<Database.Response<Models.Post>> {
    const _id = objectId(postId);
    if (_id === null)
        return Promise.resolve(Database.unallowed());
    return findOne(posts, { _id }, formatCheckerPostDatabase, postReformatter);
}

function getPostReplies(replyId: string): Promise<Database.Response<Models.Post[]>> {
    return getPost(replyId)
        .then(Database.ifSuccess(_ => {
            const _replyId = objectId(replyId);
            if (_replyId === null)
                return Database.unallowed();
            return findMany(posts, { replyId: _replyId }, formatCheckerPostDatabase, postReformatter);
        }));
}

function getUserPosts(userId: string): Promise<Database.Response<Models.Post[]>> {
    return getUser(userId)
        .then(Database.ifSuccess(_ => {
            const _userId = objectId(userId);
            if (_userId === null)
                return Database.unallowed();
            return findMany(posts, { userId: _userId }, formatCheckerPostDatabase, postReformatter);
        }));
}

function createPost(userId: string, content: string): Promise<Database.Response<Models.Post>> {
    return getUser(userId)
        .then(Database.ifSuccess(_ => {
            const _userId = objectId(userId);
            if (_userId === null)
                return Database.unallowed<string>();
            const insertQuery = { userId: _userId, replyId: null, content };
            return insertOne(posts, insertQuery);
        }))
        .then(Database.ifSuccess(id => {
            const post: Models.Post = {
                id,
                userId,
                replyId: null,
                content
            };
            return Database.success(post);
        }));
}

function createReply(userId: string, replyId: string, content: string): Promise<Database.Response<Models.Post>> {
    return getUser(userId)
        .then(Database.ifSuccess(_ => getPost(replyId)))
        .then(Database.ifSuccess(_ => insertOne(posts, { userId, replyId, content })))
        .then(Database.ifSuccess(id => {
            const post: Models.Post = {
                id,
                userId,
                replyId,
                content
            };
            return Database.success(post);
        }));
}

//
// Followers
//

function createFollower(userId: string, followerId: string): Promise<Database.Response<Models.Follower>> {
    return checkFollowersInternal(userId, followerId)
        .then(followersResponse => {
            if (followersResponse.status !== Database.ResponseType.Unallowed) {
                return followersResponse;
            }
            const _userId = objectId(userId);
            if (_userId === null)
                return Database.unallowed();
            const _followerId = objectId(followerId);
            if (_followerId === null)
                return Database.unallowed();

            const insertQuery = { userId: _userId, followerId: _followerId };
            return insertOne(followers, insertQuery)
                .then(Database.ifSuccess(_ => {
                    const follower = { userId, followerId };
                    return Database.success(follower);
                }));
        });
}

function getUserFollowers(userId: string): Promise<Database.Response<Models.User[]>> {
    return getUser(userId)
        .then(Database.ifSuccess(_ => {
            const _userId = objectId(userId);
            if (_userId === null)
                return Database.unallowed<Models.Follower[]>();

            const followersQuery = { userId: _userId };
            return findMany(followers, followersQuery, formatCheckerFollowerDatabase, followerReformatter);
        }))
        .then(Database.ifSuccess(followers => {
                const userIds: ObjectId[] = [];
                for (let follower of followers) {
                    const _userId = objectId(follower.userId);
                    if (_userId === null)
                        return Database.unallowed();
                }
                return findMany(users(), { userId: { "$in": userIds } }, formatCheckerPostDatabase, userReformatter);
        }));
}

function checkFollowersInternal(userId: string, followerId: string): Promise<Database.Response<Models.Follower>> {
    return getUser(userId)
        .then(Database.ifSuccess(() => getUser(followerId)))
        .then(Database.ifSuccess(() => {
            const _userId = objectId(userId);
            if (_userId === null)
                return Database.unallowed();
            const _followerId = objectId(followerId);
            if (_followerId === null)
                return Database.unallowed();
            const findQuery = { userId: _userId, followerId: _followerId };
            return findOne(followers, findQuery, formatCheckerFollowerDatabase, followerReformatter);
        }));
}

function checkFollowers(userId: string, followerId: string): Promise<Database.Response<boolean>> {
    return checkFollowersInternal(userId, followerId)
        .then(response => {
            if (response.status === Database.ResponseType.Failure) {
                return response;
            }
            return Database.success(response.status === Database.ResponseType.Success);
        });
}
