import { createApp } from "./app.js";
import { connectDatabase } from "./db.js";
import { env } from "./env.js";

async function startServer() {
  await connectDatabase();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`API server listening on http://localhost:${env.PORT}`);
  });
}

void startServer();