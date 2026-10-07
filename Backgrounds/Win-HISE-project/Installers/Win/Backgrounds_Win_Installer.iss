[Setup]
AppName=Backgrounds
AppVersion=1.0.0
AppVerName=Backgrounds 1.0.0
AppPublisher=Sampleson
AppPublisherURL=https://sampleson.com
DefaultDirName={code:GetDefaultDir}
DefaultGroupName=Backgrounds
SolidCompression=yes
Compression=lzma
OutputDir=.\
OutputBaseFilename=Backgrounds-1.0.0-Win-Installer
LicenseFile=EULA.txt
AdminPrivilegesRequired=yes
ChangesAssociations=no
UninstallDisplayIcon={app}\Backgrounds.exe

[Types]
Name: "full"; Description: "Full installation"
Name: "custom"; Description: "Custom installation"; Flags: iscustom

[Dirs]
Name: "{app}"; Permissions: users-modify powerusers-modify admins-modify system-modify
Name: "{userappdata}\Sampleson\Backgrounds"; Permissions: users-modify powerusers-modify admins-modify system-modify
Name: "{userappdata}\Sampleson\Backgrounds\UserPresets"; Permissions: users-modify powerusers-modify admins-modify system-modify
Name: "{userappdata}\Sampleson\Backgrounds\Semantic_s"; Permissions: users-modify powerusers-modify admins-modify system-modify

[Components]
Name: "app"; Description: "Backgrounds Standalone application"; Types: full custom
Name: "vst3_64"; Description: "Backgrounds 64-bit VST3 Plugin"; Types: full custom; Check: IsWin64
Name: "library"; Description: "Sound library (required)"; Types: full custom; Flags: fixed

[Files]
; Standalone + VST3 (signed copies live in Win Codesign)
Source: "Win Codesign\Backgrounds.exe"; DestDir: "{app}"; Flags: ignoreversion; Components: app; Check: IsWin64
Source: "Win Codesign\Backgrounds.vst3"; DestDir: "{code:GetVST3Dir_64}"; Flags: ignoreversion; Components: vst3_64; Check: IsWin64

; Library next to UserPresets; signed Windows dlls from Win Codesign
Source: "Semantic_s\*"; DestDir: "{userappdata}\Sampleson\Backgrounds\Semantic_s"; Flags: ignoreversion recursesubdirs createallsubdirs; Components: library
Source: "Win Codesign\clap_search.dll"; DestDir: "{userappdata}\Sampleson\Backgrounds\Semantic_s"; Flags: ignoreversion; Components: library
Source: "Win Codesign\onnxruntime.dll"; DestDir: "{userappdata}\Sampleson\Backgrounds\Semantic_s"; Flags: ignoreversion; Components: library

; VC++ 2015-2022 x64 runtime (only extracted if missing)
Source: "VC_redist.x64.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall; Check: NeedsVCRedist

[Icons]
Name: "{group}\Backgrounds"; Filename: "{app}\Backgrounds.exe"; Components: app
Name: "{group}\Uninstall Backgrounds"; Filename: "{uninstallexe}"

[Run]
Filename: "{tmp}\VC_redist.x64.exe"; Parameters: "/install /quiet /norestart"; StatusMsg: "Installing Visual C++ runtime..."; Flags: waituntilterminated; Check: NeedsVCRedist

[Code]
var
  VST3DirPage_64: TInputDirWizardPage;

// Inno 5.1.7 is 32-bit: pf/cf are the x86 folders. Use the 64-bit env vars.
function ProgramFiles64: String;
begin
  Result := ExpandConstant('{%ProgramW6432}');
  if Result = '' then
    Result := ExpandConstant('{pf}');
end;

function CommonFiles64: String;
begin
  Result := ExpandConstant('{%COMMONPROGRAMW6432}');
  if Result = '' then
    Result := ProgramFiles64 + '\Common Files';
end;

function GetDefaultDir(Param: String): String;
begin
  Result := ProgramFiles64 + '\Sampleson\Backgrounds';
end;

function IsVCRedistInstalled: Boolean;
var
  Installed: Cardinal;
begin
  // VS 2015-2022 share this key. 32-bit Setup reads WOW6432Node; redist writes there too.
  Result := RegQueryDWordValue(HKLM,
    'SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64',
    'Installed', Installed) and (Installed = 1);
end;

function NeedsVCRedist: Boolean;
begin
  Result := not IsVCRedistInstalled;
end;

procedure InitializeWizard;
begin
  // Don't show each file path while copying (library is huge).
  WizardForm.FilenameLabel.Visible := False;

  if IsWin64 then
  begin
    VST3DirPage_64 := CreateInputDirPage(wpSelectDir,
      'Confirm 64-Bit VST3 Plugin Directory', '',
      'Select the folder in which Setup should install the 64-bit VST3 plugin, then click Next.',
      True, '');
    VST3DirPage_64.Add('');
    VST3DirPage_64.Values[0] := CommonFiles64 + '\VST3';
  end;
end;

function GetVST3Dir_64(Param: String): String;
begin
  if IsWin64 then
    Result := VST3DirPage_64.Values[0]
  else
    Result := CommonFiles64 + '\VST3';
end;
