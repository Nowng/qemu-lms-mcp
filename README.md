# QEMU LM Studio MCP Plugin (`qemu-lms-mcp`)

An **LM Studio Plugin** that provides Large Language Models with the ability to manage, orchestrate, and interact with hardware-accelerated QEMU virtual machines. This project is a TypeScript-based wrapper around the original [razr/qemu-mcp](https://github.com/razr/qemu-mcp) Python MCP Server, enabling seamless VM lifecycle control (x86/ARM), real-time serial interaction, and raw QMP monitoring directly within LM Studio's AI context window.

---

## Features
* **TypeScript Lightweight Wrapper**: Bridges the original Python `qemu-mcp` tools to LM Studio using Node.js process orchestration.
* **Automated Setup**: The plugin automatically clones the original source tree (`razr/qemu-mcp`) and configures its Python environment upon installation! 
* **LLM-Friendly Tools**: Exposes clear, structured tools for QEMU VM management (e.g., `qemu_run_vm`, `qemu_qmp_monitor`).
* **Fully Dockerized Compatibility**: Designed to work with the original project's highly optimized Docker layouts.

---

## Installation & Usage

### 1. Install via LM Studio Hub or Local Path
```bash
# If publishing locally:
lms install /path/to/qemu-lms-mcp

# Or simply run inside your local directory after cloning this plugin repo:
npm install 
# The `postinstall` hook will automatically handle git clone and Python venv setup!
```

### 2. Configure in LM Studio
Once installed, the tools `qemu_run_vm` and `qemu_qmp_monitor` become available to your LLMs under the "Program" tab -> "Tools". 

---

## Tool Summary

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `qemu_run_vm` | Orchestrates a QEMU VM instance (x86/ARM) using embedded OS kernels. | `vmName`, `kernelPath`, `memoryMB` |
| `qemu_qmp_monitor` | Sends JSON-RPC commands to the QEMU Virtual Machine Monitor over local sockets. | `qmpCommand`, `portOverride` |

---

## Project Migration & Architecture

This project was migrated from the Python-based [razr/qemu-mcp](https://github.com/razr/qemu-mcp) server specifically for LM Studio Plugin compatibility:
1. **Preserved Source Tree**: The original source code is cloned into a local `qemu-mcp-source` folder via our `scripts/setup.cjs`. It remains untouched and can be updated via standard `git pull`.
2. **Lightweight Bridge**: We developed a TypeScript wrapper (`src/toolsProvider.ts`) that uses the LM Studio SDK (`@lmstudio/sdk`, `zod`) to define tools, which in turn invoke Python logic from the cloned repo using Node.js child processes.

---

## Credits & License

This project is built upon the incredible work of [razr/qemu-mcp](https://github.com/razr/qemu-mcp). We extend our deepest gratitude for providing an ultra-lean, fully dockerized foundation for QEMU management via MCP! 

The software is licensed under the **MIT License**, consistent with the original repository. See `LICENSE` file in this directory for details.
