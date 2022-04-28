#!/bin/bash

#* linux-update.sh: Install and update dependencies of Mind_Reader, on linux.
#* Heads-up, this expects to be run from Mind_Reader/setup-development/linux.


# If run with bash -vx, print useful information instead of just a + sign
export PS4='+(${BASH_SOURCE}:${LINENO}): ${FUNCNAME[0]:+${FUNCNAME[0]}(): }'
# If run as root, it could be because sudo isn't installed (some people disagree with sudo, especially on Arch)
ELEVATE='';if (( $UID !=0 )); then ELEVATE='sudo';fi

# Get option flags:
dry=false
while getopts d arg; do
   case $arg in
      d) dry=true;;
   esac
done

function dryrun {
   if $dry; then
      echo "> $* [dry]";
   else
      echo "> $*"
      $@
   fi
}

# Set these variables if you need to install for a different architecture
# Valid architectures are "x64", "arm64", "armhf"
arch=""
case `uname -i` in
   "x86_64")     arch="x64";;
   "armv[6-8]*") arch="armhf";;
   "aarch64")    arch="arm64";;
   *) echo "Architecture '$(uname -i)' unknown. Assuming x86_64..."
      arch="x64";;
esac

if which pacman; then
   # Install dependencies with pacman
   dryrun $ELEVATE pacman -S - < package-managers/pacman.dependencies
elif which apt-get; then
   # Install dependencies using apt-get
   dryrun xargs -a ./package-managers/apt.dependencies $ELEVATE apt-get install -y

   # Install Node Version Manager (nvm)
   # TODO: Find a better way to install nvm on Ubuntu, the official NodeJS for <20.04 is so out of date it's unsupported.
   dryrun curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
   [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

   # Check if vscode exists, if not, install it.
   # Microsoft doesn't put it in any Ubuntu repos, you have to get it straight from them.
   # This does have the side effect, however, of installing the official repository
   if !(which code); then
      #* Install VSCode
      vscodepackagename="code_amd64.deb"
      dryrun wget "https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-$arch" -O ./code.deb
      dryrun $ELEVATE apt install ./code.deb
      dryrun rm ./code.deb
   fi
fi

cdir=$(pwd)
# Go back to source tree root
cd ../..

# Check the VSCode version
nodeversion="node"
electronversion=""
#* Note:
#* When adding support for new VSCode versions, update this case
#* By the time you're working on this project, things are likely going to differ!
case `code --version` in
   #* Each version of VSCode has a corresponding Electron version and Node version
   #* These are used when
   1.66.*) electronversion="17.2.0"; nodeversion="16.14.2";;
   *) nodeversion="--lts";;
esac

# Install NodeJS and npm
dryrun nvm install "$nodeversion"
dryrun nvm use "$nodeversion"

# Use npm to install electron-rebuild and yo
dryrun npm install electron-rebuild yo generator-code

# use npm to acquire dependencies for Mind-Reader
dryrun npm install

# automatically update vulnerable packages, if possible
dryrun npm audit fix

# Use electron-rebuild to rebuild electron
if [ "$electronversion" != "" ]; then
   dryrun electron-rebuild --version $electronversion
else
   printf "%s\n%s\n%s\n%s\n"                                                             \
   "Open Visual Studio Code, select the 'Help' tab in the toolbar, and go to 'About'."   \
   "Find the line that says 'Electron: [electron version]'"                              \
   "Run the command below, filling in the Electron version with the one from that menu:" \
   "electron-rebuild --version [electron version]"
fi

cd $cdir
