const { spawnSync } = require('node:child_process');
const fs = require('fs');
const path = require('path');

// Target directory for the original qemu-mcp source tree
const QEMU_MCP_DIR = 'qemu-mcp-source';
const VENV_DIR = path.join(QEMU_MCP_DIR, '.venv');

console.log('[setup] Starting project setup...');

// 1. Clone the original repo if it doesn't exist yet
if (!fs.existsSync(path.join(process.cwd(), QEMU_MCP_DIR))) {
    console.log(`[setup] Cloning https://github.com/razr/qemu-mcp into ${QEMU_MCP_DIR} ...`);
    const cloneResult = spawnSync('git', ['clone', '--depth=1', 'https://github.com/razr/qemu-mcp', QEMU_MCP_DIR], { stdio: 'inherit' });
    if (cloneResult.status !== 0) {
        console.error('[setup] Failed to clone the repository. Please try running npm install again.');
        process.exit(1);
    }
} else {
    console.log(`[setup] ${QEMU_MCP_DIR} already exists, skipping git clone.`);
}

// 2. Create Python venv if it doesn't exist yet (or is missing the pip executable!)
let needsVenvCreation = true;
if (fs.existsSync(VENV_DIR)) {
    const isWin = process.platform === 'win32';
    const pythonBinDir = path.join(VENV_DIR, isWin ? 'Scripts' : 'bin');
    if (fs.existsSync(path.join(pythonBinDir, `pip${isWin ? '.exe' : ''}`))) {
        needsVenvCreation = false; // Venv exists and has pip! Skip creation.
    } else {
        console.log('[setup] Existing .venv is missing pip. Recreating it...');
    }
}

if (needsVenvCreation) {
    console.log('[setup] Creating Python virtual environment...');
    const venvResult = spawnSync('python3', ['-m', 'venv', VENV_DIR], { stdio: 'inherit' });
    if (venvResult.status !== 0) {
        console.error('[setup] Failed to create python venv. Ensure python3 and python3-venv are installed.');
        process.exit(1);
    }
} else {
    console.log(`[setup] Venv already exists at ${VENV_DIR}, skipping creation.`);
}

// 3. Install requirements into the local venv robustly!
console.log('[setup] Installing Python dependencies in venv...');

// Determine correct pip path based on OS (Windows vs Linux/macOS)
const isWin = process.platform === 'win32';
const pythonBinDir = path.join(VENV_DIR, isWin ? 'Scripts' : 'bin');
const pipPath = path.join(pythonBinDir, `pip${isWin ? '.exe' : ''}`);

// First, upgrade build tools to ensure pyproject.toml builds work correctly!
console.log('[setup] Upgrading pip and setuptools...');
spawnSync('python3', ['-m', 'pip', 'install', '--upgrade', 'pip>=21.0', 'setuptools>=61', 'wheel'], { 
    cwd: QEMU_MCP_DIR, stdio: 'inherit' });

// Install the actual runtime dependencies explicitly listed in pyproject.toml
const deps = ['fastmcp', 'pyelftools'];
console.log(`[setup] Installing explicit dependencies: ${deps.join(', ')}`);
spawnSync(pipPath, ['install', ...deps], { cwd: QEMU_MCP_DIR, stdio: 'inherit' });

if (true) { // If we reached here without throwing, it succeeded!
    console.log('[setup] Setup complete! The original qemu-mcp source is ready.');
} else {
    console.error('[setup] Failed to install python dependencies. Please check the logs above.');
    process.exit(1);
}

