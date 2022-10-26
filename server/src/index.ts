import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 4000;

console.log("Starting server...");
const users: Record<string, any> = {};

const usersOnlineStatus = () =>
  Object.entries(users).map(([key, value]) => ({
    username: key,
    online: !!value,
  }));

// [{ username: 'name', message: 'thing'}]
const messages = [{ username: "bot", message: "Welcome to the chat!" }];

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.post("/message", (req, res) => {
  messages.push(req.body);

  res.sendStatus(200);

  const usersWithOnline = usersOnlineStatus();
  Object.values(users).forEach((res: any) => {
    if (res) {
      res.res
        .status(200)
        .json({ messages: [req.body], users: usersWithOnline });
    }
  });
});

app.get("/poll", (req, res) => {
  const { username, from = 0 } = (req.query as unknown) as {
    username: string;
    from: number;
  };

  if (username) {
    if (users[username]) {
      users[username].end();
    }
    users[username] = res;

    req.on("close", function() {
      users[username] = null;
    });
  }

  if (from < messages.length) {
    res
      .status(200)
      .json({ messages: messages.slice(from), users: usersOnlineStatus() });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
