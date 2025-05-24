import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import requestsMount from "./requests/requests";

dotenv.config();
const port = process.env.PORT || 3000;

const app: Express = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

requestsMount(app);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
