import { Models } from "../../../../common/src/models";
import { passwordHashGenerate, passwordHashVerify } from "../../security/password";
import Database from "../database";

const databaseInterfaceMock: Database.Interface = {
    // Connection
    connect: databaseConnect,
    disconnect: databaseDisconnect,
    // Users
    createUser: databaseCreateUser,
    getUser: databaseGetUserFromUserId,
    getUserFromUsername: databaseGetUserFromUsername,
    getUserFromUsernameAndPassword: databaseGetUserFromUsernamePassword,
    setUserPrivacy: databaseSetUserPrivacy,
    // Posts
    createPost: databaseCreatePost,
    createReply: databaseCreateReply,
    getPost: databaseGetPostFromPostId,
    getUserPosts: databaseGetPostsFromUserId,
    getPostReplies: databaseGetRepliesFromPostId,
    // Followers
    checkFollowers: databaseCheckUserFollowers,
    createFollower: databaseCreateFollow,
    getUserFollowers: databaseGetUserFollowers
}
export default databaseInterfaceMock;

//
// Data
//

let idCount: number = 0;

type UserBackend = {
    id: string,
    username: string,
    password: string,
    isPrivate: boolean
};

type PostBackend = {
    id: string,
    userId: string,
    replyId: string | null,
    content: string,
};

type UserFollowsBackend = {
    userId: string
    followerId: string,
};

const users: UserBackend[] = [
    {
        id: "abcd",
        username: "andrew",
        password: await passwordHashGenerate("password1"),
        isPrivate: false
    },
    {
        id: "abc",
        username: "amity",
        password: await passwordHashGenerate("password2"),
        isPrivate: true
    },
    {
        id: "id_stephen",
        username: "stephen",
        password: await passwordHashGenerate("password_stephen"),
        isPrivate: false
    }
];

const posts: PostBackend[] = [
    {
        id: "abcde",
        userId: "abcd",
        replyId: null,
        content: "Test post"
    },
    {
        id: "abcdef",
        userId: "abcd",
        replyId: "abcde",
        content: "Test reply"
    }
];

const follows: UserFollowsBackend[] = [
    {
        userId: "abc",
        followerId: "abcd"
    },
    {
        userId: "abcd",
        followerId: "abc"
    }
];

//
// Functions
//

function convertUserBackendToFrontend(user: UserBackend): Models.User {
    const user1 = structuredClone(user);
    const user2 = user1 as any;
    user2.password = undefined;
    const user3 = user2 as Models.User;
    return user3;
}

function convertPostBackendToFrontend(post: PostBackend): Models.Post {
    return structuredClone(post) as Models.Post;
}

//
// Connection
//

function databaseConnect(): Promise<Database.Response<null>> {
    return new Promise((accept) => { accept(Database.success(null)); });
}

function databaseDisconnect(): Promise<Database.Response<null>> {
    return new Promise((accept) => { accept(Database.success(null)); });
}

//
// User
//

function databaseCreateUser(username: string, passwordHash: string): Promise<Database.Response<Models.User>> {
    return new Promise((accept) => {
        const existingUser = users.find(user => {
            return user.username === username
        });
        if (existingUser !== undefined) {
            accept(Database.unallowed());
            return;
        }
        const user: UserBackend = {
            id: idCount.toString(),
            username: username,
            password: passwordHash,
            isPrivate: false
        }
        idCount += 1;
        users.push(user);
        accept(Database.success(convertUserBackendToFrontend(user)));
    });
}

function databaseGetUserFromUserId(userId: string): Promise<Database.Response<Models.User>> {
    return new Promise((accept) => {
        const user: UserBackend | undefined = users.find(user => user.id === userId);
        if (user === undefined) {
            accept(Database.unallowed());
            return;
        }
        accept(Database.success(user));
    });
}

function databaseGetUserFromUsername(username: string): Promise<Database.Response<Models.User>> {
    return new Promise((accept) => {
        const user = users.find(user => user.username === username);
        if (user === undefined) {
            accept(Database.unallowed());
            return;
        }
        return accept(Database.success(convertUserBackendToFrontend(user)));
    });
}

function databaseGetUserFromUsernamePassword(username: string, password: string): Promise<Database.Response<Models.User>> {
    return new Promise(async (accept) => {
        const user = users.find(user => user.username === username);
        if (user === undefined) {
            accept(Database.unallowed());
            return;
        }

        passwordHashVerify(password, user.password)
        .then(verificationStatus => {
            if (!verificationStatus) {
                accept(Database.unallowed());
                return;
            }
            accept(Database.success(convertUserBackendToFrontend(user)));
        })
        .catch(error => accept(Database.failure(new Error("Mock interface - Password hash verification failed."))));
    });
}

function databaseSetUserPrivacy(userId: string, isPrivate: boolean): Promise<Database.Response<null>> {
    return new Promise((accept) => {
        const user = users.find(user => user.id === userId);
        if (user === undefined) {
            accept(Database.unallowed());
            return;
        }
        user.isPrivate = isPrivate;
        accept(Database.success(null));
    });
}

//
// Post
//

function databaseCreatePost(userId: string, content: string): Promise<Database.Response<Models.Post>> {
    return new Promise((accept) => {
        const user = users.find(user => user.id === userId);
        if (user === undefined) {
            accept(Database.unallowed());
            return;
        }
        const post: PostBackend = {
            id: idCount.toString(),
            userId: userId,
            content: content,
            replyId: null
        };
        idCount += 1;
        accept(Database.success(post));
    });
}

function databaseCreateReply(userId: string, content: string, replyId: string): Promise<Database.Response<Models.Post>> {
    return new Promise((accept) => {
        const user = users.find(user => user.id === userId);
        if (user === undefined) {
            accept(Database.unallowed());
            return;
        }
        const post = posts.find(post => post.id === replyId);
        if (post === undefined) {
            accept(Database.unallowed());
            return;
        }
        const reply: PostBackend = {
            id: idCount.toString(),
            userId: userId,
            content: content,
            replyId: replyId,
        };
        accept(Database.success(reply));
    });
}

function databaseGetPostFromPostId(postId: string): Promise<Database.Response<Models.Post>> {
    return new Promise((accept) => {
        const post: PostBackend | undefined = posts.find(post => post.id === postId);
        if (post == undefined) {
            accept(Database.unallowed());
            return;
        }
        accept(Database.success(convertPostBackendToFrontend(post)));
    });
}

function databaseGetPostsFromUserId(userId: string): Promise<Database.Response<Models.Post[]>> {
    return new Promise((accept) => {
        const user = users.find(user => user.id === userId);
        if (user === undefined) {
            accept(Database.unallowed());
            return;
        }
        const result = posts.filter(post => post.userId === userId).map(post => convertPostBackendToFrontend(post));
        accept(Database.success(result));
    });
}

function databaseGetRepliesFromPostId(postId: string): Promise<Database.Response<Models.Post[]>> {
    return new Promise((accept) => {
        const post = posts.find(post => post.id === postId);
        if (post === undefined) {
            accept(Database.unallowed());
            return;
        }
        const result = posts.filter(post => post.replyId === postId).map(post => convertPostBackendToFrontend(post));
        accept(Database.success(result));
    });
}

//
// Follows
//

function databaseCheckUserFollowers(userId: string, followerId: string): Promise<Database.Response<boolean>> {
    return new Promise((accept) => {
        const user = users.find(user => user.id == userId);
        if (user === undefined) {
            accept(Database.unallowed());
            return;
        }

        const follower = users.find(user => user.id == followerId);
        if (follower === undefined) {
            accept(Database.unallowed());
            return;
        }

        if (userId == followerId) {
            accept(Database.success(true));
            return;
        }

        const follow = follows.find(follow => follow.userId == userId && follow.followerId == followerId);
        const isFollowing = follow !== undefined;
        accept(Database.success(isFollowing));
    });
}

function databaseCreateFollow(userId: string, followingId: string): Promise<Database.Response<Models.Follower>> {
    return new Promise((accept) => {
        const user = users.find(user => user.id == userId);
        if (user === undefined) {
            accept(Database.unallowed());
            return;
        }

        const following = users.find(user => user.id === followingId);
        if (following === undefined) {
            accept(Database.unallowed());
            return;
        }

        const existingFollow = follows.find(follow => follow.userId === followingId && follow.followerId === userId);
        if (existingFollow !== undefined) {
            accept(Database.success(existingFollow));
            return;
        }

        const follow: UserFollowsBackend = {
            userId: followingId,
            followerId: userId,
        };
        follows.push(follow);
        accept(Database.success(follow));
    });
}

function databaseGetUserFollowers(userId: string): Promise<Database.Response<Models.User[]>> {
    return new Promise((accept) => {
        const user = users.find(user => user.id == userId);
        if (user === undefined) {
            accept(Database.unallowed());
            return;
        }

        const result = follows
            .filter(follow => follow.userId === userId)
            .map(follower => users.find(user => user.id == follower.followerId))
            .filter(follower => follower !== undefined)
            .map(follower => convertUserBackendToFrontend(follower));
        accept(Database.success(result));
    })
}
