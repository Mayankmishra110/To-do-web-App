import { Tool } from "../types";
import { newTool } from "./new-tool";
import { todoScan } from "./todo-scan";

export const builtinTools: Tool[] = [todoScan, newTool];
