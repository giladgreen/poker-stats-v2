import express from 'express';


export interface UserContext {
    id: string;
    subscription: string;
    firstName: string;
    familyName: string;
    email: string;
    imageUrl: string;
    hideGames:boolean;
    token: string;
    tokenExpiration: Date;
    isAdmin:boolean;
    inGroup:boolean;
    groups:any[];
}


export interface Request extends express.Request {
    request: any;
    userContext: UserContext;
}


export interface Response extends express.Response {
}

