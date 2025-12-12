import app from "./src/app.js";
import { envConfig } from "./src/config/config.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
// import morgan from "morgan";

async function startServer() {
  try {
    // setupLogging();
    await prisma.$connect();
    console.log("Database connection has been established successfully.");

    const port = envConfig.portNumber;
    app.listen(port, function () {
      console.log(`Server has started at port ${port}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
}
startServer();
