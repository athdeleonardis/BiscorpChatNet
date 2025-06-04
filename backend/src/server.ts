import express, { Express, Request, Response } from "express";
import { createHttpsServer, requestMiddlewareHttpsRedirect } from "./security/https";
import dotenv from "dotenv";
import requestsMount from "./requests/requests";
import Database from "./database/database";
import databaseInterfaceMock from "./database/interfaces/mockInterface";

//
// Initialize constants
//

dotenv.config();
const port_https = process.env.PORT_HTTPS as string;

//
// Initialize database
//

Database.setInterface(databaseInterfaceMock);

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

//
// Run both servers
//

const httpsServer = createHttpsServer(appHttps);
httpsServer.listen(port_https, () => {
  console.log(`[https server]: Listening at 'https://localhost:${port_https}'.`);
});
