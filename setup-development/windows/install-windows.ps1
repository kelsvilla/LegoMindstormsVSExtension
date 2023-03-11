<#
.synopsis
Dependency installer for Mind Reader on Windows.
This sets up a development environment from a BARE windows install.

.description
Install Git for Windows, clone the Mind Reader repository, and install all dependencies.

The script uses winget (A.K.A. "App Installer") to download and install the latest versions of each dependency, defined in winget/dependencies.json

Winget comes preinstalled on Windows 11 (21H2)/10 (21H1) or newer, and can be installed on Windows 10 1704+ through the Windows Store.
If you download Microsoft's developer VM, you have it!
As WinGet is built into Windows, it sidesteps any annoying third-party package managers, and is the lowest common denominator for package installation.

.link
https://github.com/jcode999/Mind_Reader/

.parameter GitDir
Path to clone the git repo into (Default: $HOME/git/)

.parameter AllowAdministrator
Force-allow running this script as Administrator (not recommended, despite the frequent UAC prompts!)

.parameter NoPrompt
Disable all prompts for user input, and all waiting. (not recommended when combined with AllowAdministrator!)

.parameter ForceInstall
Force installation/upgrade of all modules, even if already present on the system.

.parameter DryRun
Perform a "dry run" of the script, changing directories and running commands, but without modifying anything.

.example
./install-windows.ps1
Perform a default upgrade of all Mind Reader dependencies

.example
./install-windows.ps1 -DryRun
Perform a dry run of the upgrade process, so you can evaluate what commands will be run

.example
./install-windows.ps1 -NoPrompt
Don't prompt for user input when upgrading

.example
./install-windows.ps1 AllowAdministrator
Allow script to run as Administrator
#>

param (
   [string]$GitDir = "$HOME/git/", # Path to clone the git repo into
   [switch]$h, [switch]$Help,      # Get help
   [switch]$AllowAdministrator,    # Force allow installation as administrator
   [switch]$NoPrompt,              # Disable the 3-second wait and press-any-key prompt
   [switch]$ForceInstall,          # Always try to install
   [switch]$DryRun                 # Run script without installing
)

$RepoURI   = "https://github.com/jcode999/Mind-Reader.git"
$RepoPath  = "$GitDir\Mind-Reader"
$SetupPath = "$RepoPath\setup-development\windows"

if ($h -or $Help) {
   Get-Help ./install-windows.ps1
   exit
}

# .description
# Get-CommandAvailable: Checks whether a given command is available.
# If command is available, returns $false
function Get-CommandAvailable {
   param ($command)
   # Use a wildcard here so the command doesn't throw an exception we'd have to trycatch
   # It's not a filthy hack if it's elegant!
   RETURN (Get-Command -Name $command*)
}

#.description
# Invoke-DryRun a powershell statement
function Invoke-DryRun {
   param ([string] $command)
   $prompt = "> "
   if ($DryRun) {
      Write-Host "$prompt$command [dry]" -ForegroundColor darkgray
   }
   else {
      Write-Host "$prompt$command" -ForegroundColor white
      Invoke-Expression $command
   }
}

#.description
# Reset-Path: Reload the Path environment variable
function Reset-Path {
   Write-Output "Reloading Path..."
   #* This code was created by user [mpen](https://stackoverflow.com/users/65387/mpen) on [StackOverflow](https://stackoverflow.com/a/31845512) and is used in accordance with Creative Commons CC BY-SA 3.0
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}


# Check if Winget is available
if ( -not (Get-CommandAvailable winget) ) {
   Write-Warning "It looks like winget isn't available.`n"
   Write-Host "Update 'App Installer' through the Microsoft Store, or grab the '.msixbundle' from the winget-cli repository:"
   Write-Host "( https://github.com/microsoft/winget-cli/releases/latest )`n" -ForegroundColor White
   exit
}

# Install VSCode
if ( -not (Get-CommandAvailable code) ) {
   Write-Host "`nInstalling VSCode with winget..."
   Invoke-DryRun 'winget install --id Microsoft.VisualStudioCode'
   Reset-Path
   if ( -not (Get-CommandAvailable code)) {
      Throw "VSCode failed to install. Aborting."
   }
} else {
   Write-Host "VSCode already installed." -ForegroundColor green
}

# Install NodeJS
if ( -not (Get-CommandAvailable node) ) {
   Write-Host "`nInstalling NodeJS with winget..."
   Invoke-DryRun 'winget install OpenJS.NodeJS.LTS'
   Reset-Path
   if ( -not (Get-CommandAvailable node)) {
      Throw "NodeJS failed to install. Aborting."
   }
} else {
   Write-Host "NodeJS already installed." -ForegroundColor green
}

# Check if the user ran the script with administrator privileges.
# Warn them.
if ( ([Security.Principal.WindowsIdentity]::GetCurrent().Groups -contains 'S-1-5-32-544') ) {
   # If an administrator requests installation as administator,
   # for example, to keep UAC prompts to a minimum, allow it.
   if ($AllowAdministrator) {
      Write-Warning "Script was run as Administrator. Exit now if you didn't mean to do this!"
      # If you pass NoPrompt as an arg, you're very aware of the damage this script could do to your build env, and you just don't care
      # The true chad of sysadmins.
      if (!$NoPrompt) {
         for ( $i = 3; $i -gt 0; $i--) {
            Write-Host "Press Ctrl+C to exit. Continuing in $i...`r" -NoNewLine
            Start-Sleep 1
         }
         Write-Host    "Press any key to continue...               "
         [void][Console]::ReadKey(1) # Equivalent to Command Prompt's `pause` command
      }
   } else {
      # Throw a fatal error if the user tries to run as administrator.
      Throw "Script must be run as a normal user."
   }
}

# Install Git
#if ( -not (Get-CommandAvailable git) ) {
#   Write-Host "`nInstalling Git with winget..."
#   Invoke-DryRun 'winget install --id Git.Git'
#   Reset-Path
#   if ( -not (Get-CommandAvailable git)) {
#      Throw "Git failed to install. Aborting."
#   }
#} else {
#   Write-Host "Git already installed." -ForegroundColor green
#}
Invoke-DryRun 'winget install --id Git.Git'

# Create git directory in GitDir
if ( -not (Test-Path "$GitDir") ) {
   Invoke-DryRun "mkdir '$GitDir'"
}

# Clone the repository in GitDir
$dir = $pwd
Set-Location $GitDir
Invoke-DryRun "git clone '$RepoURI'"

# Run the install script
if ( -not (Test-Path "$SetupPath")) {
   Throw "Repository contains no subdirectory '$SetupPath'."
}
Set-Location $SetupPath
# Run upgrade-windows to install the rest of the dependency chain.
$upgradeArgs = if ($AllowAdministrator) {" -AllowAdministrator"} else {""}
$upgradeArgs += if ($DryRun) {" -DryRun"} else {""}
PowerShell ("./upgrade-windows.ps1 -Install -NoPrompt" + $upgradeArgs)
Reset-Path

# Open VSCode in the repository location
Write-Host "`nOpening Visual Studio Code"
Set-Location $RepoPath
Invoke-DryRun "code ."

Set-Location $dir
if ( -not $NoPrompt ) {
   Write-Host "`nPress any key to exit."; [void][Console]::ReadKey(1)
}
