let idCount: number = 0;

type UserBackend = {
    id: string,
    username: string,
    password: string
};

export type UserFrontend = {
    id: string,
    username: string
};

type PostBackend = {
    id: string,
    userId: string,
    replyId: string | null,
    content: string,
}

export type PostFrontend = {
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
        password: "password1"
    },
    {
        id: "abc",
        username: "amity",
        password: "password2"
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

function convertUserBackendToFrontend(user: UserBackend): UserFrontend {
    const user1 = structuredClone(user);
    const user2 = user1 as any;
    user2.password = undefined;
    const user3 = user2 as UserFrontend;
    return user3;
}

function convertPostBackendToFrontend(post: PostBackend): PostFrontend {
    return structuredClone(post) as PostFrontend;
}

//
// User
//

export function databaseCreateUser(username: string, passwordHash: string): UserFrontend | null {
    const existingUser = users.find(user => {
        return user.username === username
    });
    if (existingUser !== undefined)
        return null;
    const user: UserBackend = {
        id: idCount.toString(),
        username: username,
        password: passwordHash
    }
    idCount += 1;
    users.push(user);
    return convertUserBackendToFrontend(user);
}

export function databaseGetUserFromUserId(userId: string): UserFrontend | null {
    const user: UserBackend | undefined = users.find(user => user.id === userId);
    if (user == undefined)
        return null;
    return convertUserBackendToFrontend(user);
}

export function databaseGetUserFromUsername(username: string): UserFrontend | null {
    const user = users.find(user => user.username === username);
    if (user == undefined)
        return null;
    return convertUserBackendToFrontend(user);
}

//
// Post
//

export function databaseCreatePost(userId: string, content: string): PostFrontend | null {
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

export function databaseGetPostFromPostId(postId: string): PostFrontend | null {
    const post: PostBackend | undefined = posts.find(post => post.id === postId);
    if (post == undefined)
        return null;
    return convertPostBackendToFrontend(post);
}

export function databaseGetPostsFromUserId(userId: string): PostFrontend[] | null {
    const user = users.find(user => user.id === userId);
    if (user == undefined)
        return null;
    return posts.filter(post => post.userId === userId).map(post => convertPostBackendToFrontend(post));
}

export function databaseGetRepliesFromPostId(postId: string): PostFrontend[] | null {
    const post = posts.find(post => post.id === postId);
    if (post === undefined)
        return null;
    return posts.filter(post => post.replyId === postId).map(post => convertPostBackendToFrontend(post));
}

//
// Follows
//

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
