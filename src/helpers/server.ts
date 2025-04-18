/* eslint-disable import/extensions */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { logger } from "./logger";


export const server = new McpServer({
  name: "Codebase",
  version: "0.0.1",
});


server.server.oninitialized = () => {

  logger.info("Server initialized");

  if (server.server.getClientCapabilities()?.logging) {
    logger.setServer(server);
  }
};


server.server.onerror = (error) => {
  logger.error("Error in server:", error);
};


const closeListeners: (() => void)[] = [];

server.server.onclose = () => {

  logger.info("Server closed");

  closeListeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      logger.error("Error in close listener:", error);
    }
  });

};


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function addServerEventListener(_name: "close", listener: () => void) {
  closeListeners.push(listener);
}
