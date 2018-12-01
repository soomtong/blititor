# WINDOWS ENVIRONMENTS

## build tools

make sure native build tools. open administrator mode command line or powershell

> npm -g i windows-build-tools

```powershell
PS C:\Windows\system32> npm -g i windows-build-tools

> windows-build-tools@5.0.0 postinstall C:\Users\soomtong\AppData\Roaming\npm\node_modules\windows-build-tools
> node ./dist/index.js

Downloading vs_BuildTools.exe
[>                                            ] 0.0% (0 B/s)
Downloaded vs_BuildTools.exe. Saved to C:\Users\soomtong\.windows-build-tools\vs_BuildTools.exe.

Starting installation...
Launched installers, now waiting for them to finish.
This will likely take some time - please be patient!

Status from the installers:
---------- Visual Studio Build Tools ----------
Successfully installed Visual Studio Build Tools.
------------------- Python --------------------
Python 2.7.15 is already installed, not installing again.

Now configuring the Visual Studio Build Tools..

All done!

+ windows-build-tools@5.0.0
updated 1 package in 10.853s
```

and set env for python if you are not set it.

```powershell
setx PYTHON "%USERPROFILE%\.windows-build-tools\python27\python.exe"
```

or update your own environments manager

## install package

```
Repository\blititor> npm config set python 'C:\Program Files\Python\python.exe'
Repository\blititor> npm i
```


