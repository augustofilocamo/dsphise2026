# Firma Windows (Artifact Signing)

**Necesitás:** Azure CLI, Windows SDK (`signtool`), .NET 8 x64, `Azure.CodeSigning.Dlib.dll` (x64).  
Doc: https://learn.microsoft.com/azure/trusted-signing/how-to-signing-integrations

---

## `metadata.json` (este repo)

```json
{
  "Endpoint": "https://eus.codesigning.azure.net",
  "CodeSigningAccountName": "samplesonartifacts",
  "CertificateProfileName": "pub-samp390"
}
```

---

## Comandos

**1. Login** (device code: abrís el link y pegás el código)

```powershell
az login --use-device-code --tenant 3cad04fe-cb8f-4d7f-b4f4-364378dff8d4
```

(También podés usar el dominio del tenant, ej. `sampleson.com`, si coincide con el directorio correcto.)

**2. Dlib** (si no lo tenés: `winget install -e --id Microsoft.Azure.ArtifactSigningClientTools` o NuGet `Microsoft.ArtifactSigning.Client` → `...\bin\x64\Azure.CodeSigning.Dlib.dll`)

**3. Firmar** — ajustá la ruta del `signtool` (versión del SDK) y del **Dlib** si no coincide:

```powershell
& "C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64\signtool.exe" sign /v /debug /fd SHA256 /tr "http://timestamp.acs.microsoft.com" /td SHA256 /dlib "$env:USERPROFILE\Downloads\asclient\Microsoft.ArtifactSigning.Client\bin\x64\Azure.CodeSigning.Dlib.dll" /dmdf "C:\Filo\Boomcha\Win Codesign\metadata.json" "C:\Filo\Boomcha\Win Codesign\find_closest_groove_bar_windows.exe"
```

**4. Verificar**

```powershell
Get-AuthenticodeSignature "C:\Filo\Boomcha\Win Codesign\find_closest_groove_bar_windows.exe"
```

Debe salir **Status: Valid**.
