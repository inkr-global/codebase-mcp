/* eslint-disable import/extensions */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { existsSync } from "fs";
import { appendFile, mkdir, unlink } from "fs/promises";
import { dirname } from "path";

import { CODEBASE_PATH } from "./config";


const filePath = `${CODEBASE_PATH}/.codebase/logger.log`;

const folderPath = dirname(filePath);
if (!existsSync(folderPath)) {
  await mkdir(folderPath, { recursive: true });
}

if (existsSync(filePath)) {
  await unlink(filePath);
}


class Logger {


  private server: McpServer | undefined;

  setServer(server: McpServer) {
    this.server = server;
  }


  async log(level: "debug" | "info" | "warning" | "error", ...messages: unknown[]) {

    await Promise.all([

      (async () => {
        let content = "";
        for (const message of messages) {
          const messageString = (
            typeof message !== "object" ?
              String(message) :
              message instanceof Error ?
                JSON.stringify({
                  name: message.name,
                  message: message.message,
                  cause: message.cause,
                  stack: message.stack,
                }, null, 2) :
                JSON.stringify(message, null, 2)
          );
          content += ` ${messageString}`;
        }
        content = (
          content
            .split("\n")
            .map((line) => (
              `[${new Date().toISOString()}] [${level.toUpperCase()}] ${line}`
            ))
            .join("\n")
        );
        await appendFile(filePath, `${content}\n`, "utf-8");
      })(),

      Promise.all(messages.map(async (message) => {
        await this.server?.server.sendLoggingMessage({
          logger: "logger",
          level: level,
          data: message,
        });
      })),

    ]);

  }


  async debug(...messages: unknown[]) {
    await this.log("debug", ...messages);
  }

  async info(...messages: unknown[]) {
    await this.log("info", ...messages);
  }

  async warn(...messages: unknown[]) {
    await this.log("warning", ...messages);
  }

  async error(...messages: unknown[]) {
    await this.log("error", ...messages);
  }


}


export const logger = new Logger();
