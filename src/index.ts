import { type PluginContext } from "@lmstudio/sdk";
import { toolsProvider } from "./toolsProvider.js";

/**
 * LM Studio Plugin entry point.
 * This function is called by the LM Studio runtime to initialize the plugin.
 */
export function main(_context: PluginContext) {
  // Register the tools provider with LM Studio
  _context.withToolsProvider(toolsProvider);
  
  // Signal that the plugin has completed initialization
  return Promise.resolve();
}

// Also export toolsProvider for direct access if needed
export { toolsProvider };
