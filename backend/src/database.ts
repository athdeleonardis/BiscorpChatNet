import { Models } from "../../common/src/models";
import { passwordHashGenerate, passwordHashVerify } from "./security/password";

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
}

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
// User
//

export function databaseCreateUser(username: string, passwordHash: string): Models.User | null {
    const existingUser = users.find(user => {
        return user.username === username
    });
    if (existingUser !== undefined)
        return null;
    const user: UserBackend = {
        id: idCount.toString(),
        username: username,
        password: passwordHash,
        isPrivate: false
    }
    idCount += 1;
    users.push(user);
    return convertUserBackendToFrontend(user);
}

export function databaseGetUserFromUserId(userId: string): Models.User | null {
    const user: UserBackend | undefined = users.find(user => user.id === userId);
    if (user == undefined)
        return null;
    return convertUserBackendToFrontend(user);
}

export function databaseGetUserFromUsername(username: string): Models.User | null {
    const user = users.find(user => user.username === username);
    if (user == undefined)
        return null;
    return convertUserBackendToFrontend(user);
}

export async function databaseGetUserFromUsernamePassword(username: string, password: string): Promise<Models.User | null> {
    const user = users.find(user => user.username === username);
    if (user === undefined)
        return null;
    try {
        if (await passwordHashVerify(password, user.password)) {
            return convertUserBackendToFrontend(user);
        }
        return null;
    } catch {
        return null;
    }
}

//
// Post
//

export function databaseCreatePost(userId: string, content: string): Models.Post | null {
    const user = users.find(user => user.id === userId);
    if (user === undefined)
        return null;
    const post: PostBackend = {
        id: idCount.toString(),
        userId: userId,
        content: content,
        replyId: null
    };
    idCount += 1;
    return post;
}

export function databaseCreateReply(userId: string, content: string, replyId: string) {
    const user = users.find(user => user.id === userId);
    if (user === undefined)
        return null;
    const post = posts.find(post => post.id === replyId);
    if (post === undefined)
        return null;
    const reply: PostBackend = {
        id: idCount.toString(),
        userId: userId,
        content: content,
        replyId: replyId,
    };
    return reply;
}

export function databaseGetPostFromPostId(postId: string): Models.Post | null {
    const post: PostBackend | undefined = posts.find(post => post.id === postId);
    if (post == undefined)
        return null;
    return convertPostBackendToFrontend(post);
}

export function databaseGetPostsFromUserId(userId: string): Models.Post[] | null {
    const user = users.find(user => user.id === userId);
    if (user == undefined)
        return null;
    return posts.filter(post => post.userId === userId).map(post => convertPostBackendToFrontend(post));
}

export function databaseGetRepliesFromPostId(postId: string): Models.Post[] | null {
    const post = posts.find(post => post.id === postId);
    if (post === undefined)
        return null;
    return posts.filter(post => post.replyId === postId).map(post => convertPostBackendToFrontend(post));
}

//
// Follows
//

export function databaseCheckUserFollowers(userId: string, followerId: string): boolean {
    if (userId == followerId)
        return true;
    const follow = follows.find(follow => follow.userId == userId && follow.followerId == followerId);
    return follow !== undefined;
}

export function databaseCreateFollow(userId: string, followingId: string): boolean | null {
    const user = users.find(user => user.id == userId);
    if (user === undefined)
        return null;
    const following = users.find(user => user.id === followingId);
    if (following === undefined)
        return null;
    const existingFollow = follows.find(follow => follow.userId === followingId && follow.followerId === userId);
    if (existingFollow !== undefined)
        return false;
    const follow: UserFollowsBackend = {
        userId: followingId,
        followerId: userId,
    };
    follows.push(follow);
    return true;
}

export function databaseGetUserFollowers(userId: string): string[] | null {
    const user: UserBackend | undefined = users.find(user => user.id == userId);
    if (user === undefined)
        return null;
    return follows.filter(follow => follow.userId === userId).map(follow => follow.followerId);
}
