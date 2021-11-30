<!-- header with logo -->
<p align="center">
<img alt="Mind Reader Logo" src="./media/logo.png"></img>
</p>

<h1>Mind_Reader</h1>

<!-- overview description -->

The current editor options available lack the level of accessibility that is
required to allow people who are visually impaired to adequately write, edit,
and debug code. 

This tool extends Visual Studio Code’s existing
accessibility options to enable people with a visual impairment to learn
Python programming with LEGO Mindstorms. Our goal is to:

- provide an accessible experience to people with a visual impairment

- **not** change the editing workflow for people without a visual impairment

## Major Features

- Compatibility with major screen readers:

    - [NVDA](https://www.nvaccess.org/)
    - [JAWS](https://www.freedomscientific.com/products/software/jaws/)
    - [Apple VoiceOver](https://support.apple.com/guide/voiceover-guide/welcome/web/)

<!-- TODO: still need this -->
- Play audio alerts for syntax and runtime errors.

- Present a summary of the scope for an individual line of code.

- Save and load programs directly onto the LEGO Hub from within Visual Studio Code

# For Developers

## Dependencies
<!-- TODO: version information -->
<!-- TODO: how to support native-usb functionality? -->
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/)

## Development Quick Start
Use the following to set up the extension for development.

```console
$ git clone https://github.com/SingleSemesterSnobs/Mind_Reader.git
$ cd Mind_Reader
$ npm install
```

While inside the repository do

```console
$ code .
```

to open the cloned repository in VS Code.

Then, use "Run > Start Debugging" on the menu bar to start the [Extension
Development Host](https://code.visualstudio.com/api/advanced-topics/extension-host)
(<kbd>F5</kbd> by default).

---

See the Visual Studio Code [getting started](https://code.visualstudio.com/api/get-started/your-first-extension)
API page if you need more help.
