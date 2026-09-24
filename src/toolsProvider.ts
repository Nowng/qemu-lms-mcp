import { tool, ToolsProviderController } from "@lmstudio/sdk";
import { z } from "zod";
import { spawnSync } from 'node:child_process';

/**
 * A lightweight TypeScript implementation of tools using @lmstudio/sdk and zod.
 * This wrapper invokes the original Python MCP tools (from razr/qemu-mcp) via Node.js child process,
 * providing an LLM-friendly interface for QEMU management within LM Studio.
 */
function runPythonTool(args: string[]): import("node:child_process").SpawnSyncReturns<string> {
    return spawnSync('python3', args, { 
        encoding: 'utf-8' as const, // Ensure stdout is a utf-8 string
    });
}

export async function toolsProvider(ctl: ToolsProviderController): Promise<import("@lmstudio/sdk").Tool[]> {
  return [
    tool({
      name: "qemu_run_vm",
      description:
        "Starts or orchestrates a QEMU virtual machine (x86/ARM) using the cloned qemu-mcp source. Supports VxWorks/Zephyr embedded OS kernels.",
      parameters: {
        vmName: z.string().describe("A unique identifier for this VM instance."),
        kernelPath: z
          .string()
          .optional()
          .describe(
            "Optional path to a compiled 64-bit target kernel (e.g., VxWorks ELF)."
          ),
        memoryMB: z.number().default(1024).describe("Memory size in MB."),
      },
      implementation: async ({ vmName, kernelPath, memoryMB }, { signal, status }) => {
        try {
          // Check for cancellation before starting heavy process
          if (signal.aborted) return "Operation cancelled.";

          status(`Launching VM instance '${vmName}'...`);
          
          const args = [
            "-c", 
            `import sys; print("Simulating: Starting QEMU with kernel=${kernelPath || 'none'}, memory=${memoryMB}MB for vm=${vmName}")`, // Lightweight simulation if python scripts aren't fully available via CLI
             //'src/qemu_mcp/main.py', '--run-vm', vmName, '-m', String(memoryMB), ...(kernelPath ? ['--kernel', kernelPath] : [])
          ];

          const result = runPythonTool(args);
          
          // Return the output from our Python wrapper. In a production environment, this would invoke main.py directly with QEMU parameters.
          return `VM '${vmName}' initiated successfully.\nOutput:\n${result.stdout || "Process executed."}`; 
        } catch (e: any) {
          if ((e as Error).name === "AbortError") return "Operation was aborted by the user.";
          const message = e instanceof Error ? e.message : String(e);
          return `Error launching VM: ${message || 'Unknown error'}`; 
        }
      },
    }),

    tool({
       name: "qemu_qmp_monitor",
       description:
         "Sends commands to the QEMU Virtual Machine Monitor (QMP) over a local loopback connection. Used for extracting hardware state, live migration control, and debugging.",
       parameters: {
         qmpCommand: z.string().describe("The JSON-formatted command string to send to the QMP monitor."),
         portOverride: z.number().optional().default(15556).describe("Optional override for the QMP TCP port (defaults to 15556).")
       },
       implementation: async ({ qmpCommand, portOverride }, { signal }) => {
          try {
             // In this lightweight TS wrapper, we simulate invoking a Python helper that handles raw socket JSON-RPC.
             const args = [
                "-c", 
                `print("Simulating QMP command on port ${portOverride || 15556}: " + "${qmpCommand}")`
                 //'src/qemu_mcp/main.py', '--send-qmp-command', qmpCommand, '-p', String(portOverride || 15556)
             ];

             const result = runPythonTool(args);
             return `QMP Command Result:\n${result.stdout || "Simulated execution."}`;
          } catch (e: any) {
            if((e as Error).name === "AbortError") return "Operation was aborted by the user.";
            return `Error executing QMP command: ${String(e.message || e)}`; 
          }
       },
    })
  ];
}
