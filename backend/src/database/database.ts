import { Models } from "../../../common/src/models";
import { Response as ExpressResponse } from "express";

namespace Database {
    export enum ResponseType {
        Success,
        Failure,
        Unallowed
    };
    export type ResponseSuccess<T> = { status: ResponseType.Success, data: T };
    export type Response<T> = { status: Database.ResponseType.Failure, error: Error } | { status: Database.ResponseType.Unallowed } | Database.ResponseSuccess<T>;

    export interface Interface {
        // Connection
        connect: () => Promise<Database.Response<null>>;
        disconnect: () => Promise<Database.Response<null>>;
        // Users
        createUser: (username: string, password: string) => Promise<Database.Response<Models.User>>;
        getUser: (userId: string) => Promise<Database.Response<Models.User>>;
        getUserFromUsername: (username: string) => Promise<Database.Response<Models.User>>;
        getUserFromUsernameAndPassword: (username: string, password: string) => Promise<Database.Response<Models.User>>;
        setUserPrivacy: (userId: string, isPrivate: boolean) => Promise<Database.Response<null>>;
        // Posts
        createPost: (userId: string, content: string) => Promise<Database.Response<Models.Post>>;
        createReply: (userId: string, replyId: string, content: string) => Promise<Database.Response<Models.Post>>;
        getPost: (postId: string) => Promise<Database.Response<Models.Post>>;
        getUserPosts: (userId: string) => Promise<Database.Response<Models.Post[]>>;
        getPostReplies: (replyId: string) => Promise<Database.Response<Models.Post[]>>;
        // Followers
        checkFollowers: (userId: string, followerId: string) => Promise<Database.Response<boolean>>;
        createFollower: (userId: string, followerId: string) => Promise<Database.Response<Models.Follower>>;
        getUserFollowers: (userId: string) => Promise<Database.Response<Models.User[]>>;
    }

    let databaseInterfaceInternal: Interface | undefined = undefined;

    export function setInterface(databaseInterface: Interface) {
        databaseInterfaceInternal = databaseInterface;
    }
    
    export function queries(): Database.Interface {
        if (databaseInterfaceInternal === undefined)
            throw new Error("Database interface not initialized! Set an interface with 'Database.setInterface'.");
        return databaseInterfaceInternal;
    }

    export function success<T>(data: T): Database.Response<T> {
        return {
            status: Database.ResponseType.Success,
            data: data
        };
    }

    export function failure<T>(error: Error): Database.Response<T> {
        return { status: Database.ResponseType.Failure, error };
    }

    export function unallowed<T>(): Database.Response<T> {
        return { status: Database.ResponseType.Unallowed };
    }

    export function onNonSuccess<T>(res: ExpressResponse, unallowedCode: number, databaseResponse: Database.Response<T>): boolean {
        switch (databaseResponse.status) {
            case Database.ResponseType.Failure: {
                res.sendStatus(500);
                return true;
            }
            case Database.ResponseType.Unallowed: {
                res.sendStatus(unallowedCode);
                return true;
            }
        }
        return false;
    }

    export function getData<T>(response: Database.Response<T>) {
        const responseInternal = response as Database.ResponseSuccess<T>;
        return responseInternal.data;
    }

    export function ifSuccess<T,U>(callback: (input: T) => Database.Response<U> | Promise<Database.Response<U>>): (input: Database.Response<T>) => Promise<Database.Response<U>> {
        return (input: Database.Response<T>) => new Promise((accept) => {
            if (input.status !== Database.ResponseType.Success) {
                accept(input);
                return;
            }
            accept(callback(input.data));
        });
    }

    export function ifUnallowed<T,U>(callback: () => Database.Response<U> | Promise<Database.Response<U>>): (input: Database.Response<T>) => Promise<Database.Response<U>> {
        return (input: Database.Response<T>) => new Promise((accept) => {
            if (input.status === Database.ResponseType.Failure) {
                accept(input);
                return;
            }
            if (input.status === Database.ResponseType.Success) {
                accept(Database.unallowed());
                return;
            }
            accept(callback());
        });
    }
}

export default Database;
