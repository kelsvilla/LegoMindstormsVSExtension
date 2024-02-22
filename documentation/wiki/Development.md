# Development environment setup guide

### Windows 10 or 11

1. Clone this repo
2. Open a terminal to the root directory
    - You can achieve that by doing one of the following:
        - Press **Control-Shift-`** in VS Code
        - Select on the menu bar, Terminal > New Terminal in VS Code
        - Typing "cmd" in the address bar of the directory in File Explorer
3. Run `npm i`

### macOS

1. Clone this repo
2. Open a terminal to the root directory
    - You can achieve that by doing one of the following:
        - Press **Control-Shift-`**
        - Select on the menu bar, Terminal > New Terminal
3. Run `npm i`

# Running the Extension

1. Have a terminal open and make sure that it is in the root directory
2. Run `npm run compile`. This will compile the TypeScript files.
3. Run `npm run watch`. This will reload the extension if you make any changes to the files.
4. Run the extension by pressing the F5 key
    - You can also select the "Run and Debug" tab, then select "Run Extension" and press the green play button

# Alternative

Instead of cloning this repo, you could also

-   Download the [install-windows.ps1](setup-development/windows/install-windows.ps1) file (Windows) and run `./install-windows.ps1` in PowerShell as a normal user, and accept any UAC prompts that pop-up.
    -   The installation should take around 8 minutes. If an installer doesn't pop up, don't be alarmed.
-   Download the [install-linux.sh](setup-development/windows/install-linux.sh) file (Mac) and run `./install-linux.sh` in the terminal.

For other platforms, or to install the extension manually, check out our [Developer Install Guide](../../wiki/Developer-Install-Guide). This is also where you should search if you encounter errors.

See the Visual Studio Code [getting started](https://code.visualstudio.com/api/get-started/your-first-extension)
API page if you need more help.

# Notes

Be sure to checkout [PR Checklist](https://github.com/kelsvilla/LegoMindstormsVSExtension/wiki/PR-Checklist) to learn what to look out for when you make a pull request.
