import Database from "../database";

export function testWrapperInterface(databaseInterface: Database.Interface): Database.Interface {
    return {
        connect: () => databaseInterface.connect().then(wrapperResponse),
        disconnect: () => databaseInterface.disconnect().then(wrapperResponse),

        createUser: (username: string, password: string) => databaseInterface.createUser(username, password).then(wrapperResponse),
        getUser: (userId: string) => databaseInterface.getUser(userId).then(wrapperResponse),
        getUserFromUsername: (username: string) => databaseInterface.getUserFromUsername(username).then(wrapperResponse),
        getUserFromUsernameAndPassword: (username: string, password: string) => databaseInterface.getUserFromUsernameAndPassword(username, password).then(wrapperResponse),
        setUserPrivacy: (userId: string, isPrivate: boolean) => databaseInterface.setUserPrivacy(userId, isPrivate).then(wrapperResponse),

        createPost: (userId: string, content: string) => databaseInterface.createPost(userId, content).then(wrapperResponse),
        createReply: (userId: string, replyId: string, content: string) => databaseInterface.createReply(userId, replyId, content).then(wrapperResponse),
        getPost: (postId: string) => databaseInterface.getPost(postId).then(wrapperResponse),
        getUserPosts: (userId: string) => databaseInterface.getUserPosts(userId).then(wrapperResponse),
        getPostReplies: (replyId: string) => databaseInterface.getPostReplies(replyId).then(wrapperResponse),
        
        checkFollowers: (userId: string, followerId: string) => databaseInterface.checkFollowers(userId, followerId).then(wrapperResponse),
        createFollower: (userId: string, followerId: string) => databaseInterface.createFollower(userId, followerId).then(wrapperResponse),
        getUserFollowers: (userId: string) => databaseInterface.getUserFollowers(userId).then(wrapperResponse)
    };
}

function wrap<T>(func: (...arg0: any[]) => Promise<Database.Response<T>>, ...args: any[]) {
    return func(args);
}

function wrapperResponse<T>(response: Database.Response<T>): Database.Response<T> {
    if (response.status === Database.ResponseType.Failure) {
        console.log(response.error);
    };
    return response;
}