import { checkFormatIs, checkFormatIsBoolean, checkFormatIsObject, checkFormatIsString } from "./checkFormat";

export namespace Models {
    export type User = {
        id: string,
        username: string,
        isPrivate: boolean
    };

    export const formatCheckerUser = checkFormatIsObject({
        id: checkFormatIsString,
        username: checkFormatIsString,
        isPrivate: checkFormatIsBoolean
    });
    
    export type Post = {
        id: string,
        userId: string,
        replyId: string | null,
        content: string,
    };

    export const formatCheckerPost = checkFormatIsObject({
        id: checkFormatIsString,
        userId: checkFormatIsString,
        replyId: checkFormatIs(null),
        content: checkFormatIsString
    });

    export const formatCheckerReply = checkFormatIsObject({
        id: checkFormatIsString,
        userId: checkFormatIsString,
        replyId: checkFormatIsString,
        content: checkFormatIsString
    });

    export type Follower = {
        userId: string,
        followerId: string
    };

    export const formatCheckerFollower = checkFormatIsObject({
        userId: checkFormatIsString,
        followerId: checkFormatIsString
    });
}


