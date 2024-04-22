python -m venv %~dp0venv
call %~dp0venv\Scripts\activate.bat
pip install --disable-pip-version-check -r %~dp0requirementswin.txt