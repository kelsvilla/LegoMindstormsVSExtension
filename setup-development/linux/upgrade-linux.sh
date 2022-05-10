#!/bin/bash

#* linux-update.sh: Install and update dependencies of Mind Reader, on linux.
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

# Get whether the user is running in Windows Subsystem for Linux
function getwsl {
   grep "[Mm]icrosoft" /proc/version > /dev/null
   return $?
}

# Get the user's default login shell
function getsh {
   #* This code was created by user [Todd A. Jacobs](https://stackoverflow.com/users/1301972/todd-a-jacobs) on [StackOverflow](https://stackoverflow.com/a/11059152) and is used in accordance with Creative Commons CC BY-SA 3.0
   getent passwd $LOGNAME | cut -d: -f7
}

# Install NVM (this is gross, but the recommended way to install nvm)
function installnvm {
   # nvm's install script tries to be smart, so we have to work around its supposed cleverness
   usershell=`getsh`
   wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | dryrun "$usershell"
   # Reload profile
   case $usershell in
      */bash) dryrun . ~/.bashrc ~/.bashprofile;;
      */zsh)  dryrun . ~/.zshrc;;
      *) "Your shell, $usershell, is currently unsupported by nvm. It's up to you to set up your development environment."; exit;;
   esac
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
   printf "Installing dependencies with pacman...\n"
   cat ./package-managers/pacman.dependencies | dryrun $ELEVATE pacman -S --needed -
   # If not in Windows Subsystem for Linux, install vscode
   [[ !(getwsl) ]] && dryrun $ELEVATE pacman -S --needed code
   # Install Node Version Manager
   installnvm

elif which apt-get; then
   # Install dependencies using apt-get
   printf "Installing dependencies with apt...\n"
   dryrun xargs -a ./package-managers/apt.dependencies $ELEVATE apt-get install -y
   # Check if vscode exists, if not, install it.
   # Microsoft doesn't put it in any Ubuntu repos, you have to get it straight from them.
   # This does have the side effect, however, of installing the official repository
   # Don't attempt to install vscode if running in WSL; it can cause problems.
   if !(which code) && !(getwsl); then
      #* Install VSCode
      vscodepackagename="code_amd64.deb"
      dryrun wget "https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-$arch" -O ./code.deb
      dryrun $ELEVATE apt install ./code.deb
      dryrun rm ./code.deb
   fi
      # Install Node Version Manager (nvm)
   installnvm

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
   #* These are used when configuring nvm
   1.66.*) electronversion="17.2.0"; nodeversion="16.13.0";;
   1.67.*) electronversion="17.4.1"; nodeversion="16.13.0";;
   *) nodeversion="--lts";;
esac

# Install NodeJS and npm
printf "\nInstalling node $nodeversion\n"
dryrun nvm install "$nodeversion"
dryrun nvm use "$nodeversion"

# Use npm to install electron-rebuild and yo
printf "Installing electron-rebuild and vsce\n"
dryrun npm install -g electron-rebuild vsce

# use npm to acquire dependencies for Mind-Reader
printf "\nAcquiring dependencies...\n"
dryrun npm install

# automatically update vulnerable packages, if possible
printf "\nUpdating vulnerable packages, if possible...\n"
dryrun npm audit fix

# Use electron-rebuild to rebuild electron
if [[ "$electronversion" != "" ]]; then
   printf "\nRebuilding electron with version $electronversion...\n"
   dryrun electron-rebuild --version $electronversion
else
   printf "\n%s\n%s\n%s\n%s\n"                                                             \
   "Open Visual Studio Code, select the 'Help' tab in the toolbar, and go to 'About'."   \
   "Find the line that says 'Electron: [electron version]'"                              \
   "Run the command below, filling in the Electron version with the one from that menu:" \
   "electron-rebuild --version [electron version]"
fi

cd $cdir
echo "Done!"
