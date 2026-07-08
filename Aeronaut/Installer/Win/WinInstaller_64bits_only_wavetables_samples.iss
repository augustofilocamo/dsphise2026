[Setup]

AppName=Aeronaut
AppVersion=1.0.0
AppVerName=Release

DefaultDirName={pf}\Sampleson\Aeronaut
DefaultGroupName=Aeronaut
SolidCompression=yes
OutputDir=.\
ArchitecturesInstallIn64BitMode=x64
OutputBaseFilename=Aeronaut-1.0.0-Win-Installer
LicenseFile=EULA.txt
PrivilegesRequired=admin

ChangesAssociations=no

[Types]
Name: "full"; Description: "Full installation"
Name: "custom"; Description: "Custom installation"; Flags: iscustom

[Dirs]
Name: "{app}\"; Permissions: users-modify powerusers-modify admins-modify system-modify

[Components]
; Name: "app"; Description: "Aeronaut Standalone application"; Types: full custom;
Name: "vst3_64"; Description: "Aeronaut  64-bit VST3 Plugin"; Types: full custom; Check: Is64BitInstallMode;


[Files]

; Standalone
; Source: "Aeronaut.exe"; DestDir: "{app}"; Flags: ignoreversion; Components: app; Check: Is64BitInstallMode

; VST
Source: "Aeronaut.vst3"; DestDir: "{code:GetVST3Dir_64}"; Flags: ignoreversion; Components: vst3_64; Check: Is64BitInstallMode

; AUDIO FILES
; Source: "*.hwt"; DestDir: "{userappdata}\Sampleson\Aeronaut\AudioFiles"; Flags: ignoreversion recursesubdirs;
; Source: "MidiFiles.dat"; DestDir: "{userappdata}\Sampleson\Aeronaut"; Flags: ignoreversion recursesubdirs;
; Source: "pattern_bank.bbank"; DestDir: "{userappdata}\Sampleson\Aeronaut"; Flags: ignoreversion recursesubdirs;
; Source: "*.ch1"; DestDir: "{app}\Samples"; Flags: ignoreversion recursesubdirs;

; LINKWINDOWS FILE

; Source: "LinkWindows"; DestDir: "{userappdata}\Sampleson\Aeronaut"; Flags: ignoreversion recursesubdirs;




[Icons]
Name: "{group}\Aeronaut"; Filename: "{app}\Aeronaut  x86.exe"; Check: not Is64BitInstallMode
Name: "{group}\Uninstall Aeronaut "; Filename: "{app}\unins000.exe"

[Code]
var
  OkToCopyLog : Boolean;
  VST3DirPage_64: TInputDirWizardPage;

Procedure InitializeWizard;

begin

  if IsWin64 then begin
    VST3DirPage_64 := CreateInputDirPage(wpSelectDir,
    'Confirm 64-Bit VST2 Plugin Directory', '',
    'Select the folder in which setup should install the 64-bit VST3 Plugin, then click Next.',
    True, '');
    VST3DirPage_64.Add('');
   // VST3DirPage_64.Values[0] := ExpandConstant('{reg:HKLM\SOFTWARE\VST,VSTPluginsPath|{pf}\Common Files\VST3}\');
      VST3DirPage_64.Values[0] := ExpandConstant('{pf}\Common Files\VST3');

   // VST2DirPage_32 := CreateInputDirPage(wpSelectDir,
   //   'Confirm 32-Bit VST2 Plugin Directory', '',
   //   'Select the folder in which setup should install the 32-bit VST2 Plugin, then click Next.',
    //  False, '');
   // VST2DirPage_32.Add('');
   // VST2DirPage_32.Values[0] := ExpandConstant('{reg:HKLM\SOFTWARE\WOW6432NODE\VST,VSTPluginsPath|{pf32}\Steinberg\VSTPlugins}\');
  //end else begin
  //  VST2DirPage_32 := CreateInputDirPage(wpSelectDir,
  //    'Confirm 32-Bit VST2 Plugin Directory', '',
  //    'Select the folder in which setup should install the 32-bit VST2 Plugin, then click Next.',
  //    False, '');
  //  VST2DirPage_32.Add('');
  //  VST2DirPage_32.Values[0] := ExpandConstant('{reg:HKLM\SOFTWARE\VST,VSTPluginsPath|{pf}\Steinberg\VSTPlugins}\');
  end;
end;

//function GetVST2Dir_32(Param: String): String;
//begin
  //Result := VST2DirPage_32.Values[0]
//end;

function GetVST3Dir_64(Param: String): String;
begin
  Result := VST3DirPage_64.Values[0]
end;

Procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssDone then
    OkToCopyLog := True;
end;

Procedure DeinitializeSetup();
begin
 // if OkToCopyLog then
 //   FileCopy (ExpandConstant ('{log}'), ExpandConstant ('{app}\InstallationLogFile.log'), FALSE);
 // RestartReplace (ExpandConstant ('{log}'), '');
end;

[UninstallDelete]
Type: files; Name: "{app}\InstallationLogFile.log"
