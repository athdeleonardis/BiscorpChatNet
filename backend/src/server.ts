import express, { Express, Request, Response } from "express";
import { createHttpsServer, requestMiddlewareHttpsRedirect } from "./security/https";
import dotenv from "dotenv";
import requestsMount from "./requests/requests";
import Database from "./database/database";
import databaseInterface from "./database/interfaces/mongodbInterface";
import { testWrapperInterface } from "./database/interfaces/testWrapperInterface";

//
// Initialize constants
//

dotenv.config();
const port_https = process.env.PORT_HTTPS as string;

//
// Initialize database
//

Database.setInterface(testWrapperInterface(databaseInterface));

//
// Initialize HTTPS server
//

const appHttps: Express = express();
appHttps.use(express.json());
appHttps.use(requestMiddlewareHttpsRedirect);

appHttps.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

requestsMount(appHttps);

const httpsServer = createHttpsServer(appHttps);

//
// Run server
//

Database.queries().connect()
    .then(response => {
        if (response.status !== Database.ResponseType.Success) {
            throw new Error('Failed to connect to database.');
        }
        console.log('[mongodb]: Connected.');

        httpsServer.listen(port_https, () => {
            console.log(`[https server]: Listening at 'https://localhost:${port_https}'.`);
        });
    });
