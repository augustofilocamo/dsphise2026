#!/bin/bash

# Aeronaut Mac Installer Notarization - Correct Flow
# Plugins only (.vst3 + .component): sign → notarize → staple → PKG → sign PKG → notarize PKG

set -e

# Configuration - UPDATE THESE AS NEEDED
DEVELOPER_ID_APPLICATION="Developer ID Application: AUGUSTO FILOCAMO (3987UA4K7Q)"
DEVELOPER_ID_INSTALLER="Developer ID Installer: AUGUSTO FILOCAMO"
KEYCHAIN_PROFILE="notarytool2023"
PROJECT_NAME="Aeronaut"
VERSION="1.0.0"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

HAS_VST3=0
HAS_AU=0
[ -d "Aeronaut.vst3" ] && HAS_VST3=1
[ -d "Aeronaut.component" ] && HAS_AU=1

if [ "$HAS_VST3" -eq 0 ] && [ "$HAS_AU" -eq 0 ]; then
    print_error "Neither Aeronaut.vst3 nor Aeronaut.component found in $(pwd)"
    exit 1
fi

print_status "Working directory: $(pwd)"
print_status "=== Aeronaut MAC NOTARIZATION - PLUGINS ONLY (VST3 + AU) ==="

# STEP 1: Sign plugins
print_status "=== STEP 1: SIGNING PLUGINS ==="

if [ "$HAS_VST3" -eq 1 ]; then
    print_status "1.1 Signing Aeronaut.vst3..."
    codesign --deep --force --options runtime --sign "$DEVELOPER_ID_APPLICATION" "Aeronaut.vst3"
    print_success "Aeronaut.vst3 signed successfully"
else
    print_warning "Aeronaut.vst3 not found, skipping..."
fi

if [ "$HAS_AU" -eq 1 ]; then
    print_status "1.2 Signing Aeronaut.component..."
    codesign --deep --force --options runtime --sign "$DEVELOPER_ID_APPLICATION" "Aeronaut.component"
    print_success "Aeronaut.component signed successfully"
else
    print_warning "Aeronaut.component not found, skipping..."
fi

# STEP 2: Notarize each plugin individually
print_status "=== STEP 2: NOTARIZING PLUGINS INDIVIDUALLY ==="

print_status "2.1 Creating individual zip files..."

ZIP_VST3=""
ZIP_AU=""

if [ "$HAS_VST3" -eq 1 ]; then
    print_status "2.1.1 Creating zip for Aeronaut.vst3..."
    ZIP_VST3="${PROJECT_NAME}-vst3-${VERSION}.zip"
    [ -f "$ZIP_VST3" ] && rm "$ZIP_VST3"
    zip -r -X "$ZIP_VST3" Aeronaut.vst3 -x "*/__MACOSX/*" "*/\.DS_Store" "*/\._*"
fi

if [ "$HAS_AU" -eq 1 ]; then
    print_status "2.1.2 Creating zip for Aeronaut.component..."
    ZIP_AU="${PROJECT_NAME}-au-${VERSION}.zip"
    [ -f "$ZIP_AU" ] && rm "$ZIP_AU"
    zip -r -X "$ZIP_AU" Aeronaut.component -x "*/__MACOSX/*" "*/\.DS_Store" "*/\._*"
fi

print_status "2.2 Submitting plugins for notarization..."

if [ -n "$ZIP_VST3" ]; then
    print_status "2.2.1 Submitting Aeronaut.vst3 for notarization..."
    xcrun notarytool submit --keychain-profile "$KEYCHAIN_PROFILE" "$ZIP_VST3" --wait
    print_success "Aeronaut.vst3 notarization completed"
fi

if [ -n "$ZIP_AU" ]; then
    print_status "2.2.2 Submitting Aeronaut.component for notarization..."
    xcrun notarytool submit --keychain-profile "$KEYCHAIN_PROFILE" "$ZIP_AU" --wait
    print_success "Aeronaut.component notarization completed"
fi

print_success "All plugins notarized successfully"

print_status "2.3 Stapling plugins..."
if [ "$HAS_VST3" -eq 1 ]; then
    xcrun stapler staple "Aeronaut.vst3"
fi
if [ "$HAS_AU" -eq 1 ]; then
    xcrun stapler staple "Aeronaut.component"
fi

print_success "All plugins stapled successfully"

# STEP 3: Create PKG with Packages
print_status "=== STEP 3: CREATING PKG WITH PACKAGES ==="
print_status "3.1 Opening Packages to create PKG..."
print_warning "Please manually create the PKG using $PROJECT_NAME.pkgproj in Packages app"
print_warning "Save the PKG in build/ directory with '$PROJECT_NAME' in the filename (e.g., build/${PROJECT_NAME}-${VERSION}-Mac-Installer.pkg)"
print_warning "Press Enter when the PKG is created and saved..."

read -p "Press Enter to continue after creating the PKG..."

# Check if PKG was created - look for any file containing PROJECT_NAME in build/ directory
print_status "Looking for PKG file containing '$PROJECT_NAME' in build/ directory..."
PKG_NAME=""
for file in build/*.pkg; do
    if [[ -f "$file" && "$(basename "$file")" == *"$PROJECT_NAME"* ]]; then
        PKG_NAME="$file"
        break
    fi
done

if [ -z "$PKG_NAME" ]; then
    print_error "PKG file containing '$PROJECT_NAME' not found in build/ directory"
    print_error "Please create the PKG using Packages app and save it with '$PROJECT_NAME' in the filename"
    print_error "Available .pkg files in build/:"
    ls -la build/*.pkg 2>/dev/null || echo "No .pkg files found in build/"
    exit 1
fi

print_success "PKG file found: $PKG_NAME"

# STEP 4: Sign the PKG
print_status "=== STEP 4: SIGNING THE PKG ==="
print_status "4.1 Signing the installer package..."

SIGNED_PKG_NAME="${PROJECT_NAME}-${VERSION}-Mac-Installer-Signed.pkg"
productsign --sign "$DEVELOPER_ID_INSTALLER" "$PKG_NAME" "$SIGNED_PKG_NAME"

print_success "PKG signed successfully: $SIGNED_PKG_NAME"

# STEP 5: Submit PKG for notarization
print_status "=== STEP 5: SUBMITTING PKG FOR NOTARIZATION ==="
print_status "5.1 Submitting PKG for notarization..."
print_warning "This may take several minutes..."

xcrun notarytool submit --keychain-profile "$KEYCHAIN_PROFILE" "$SIGNED_PKG_NAME" --wait

print_success "PKG notarization completed"

# STEP 6: Staple the PKG
print_status "=== STEP 6: STAPLING THE PKG ==="
print_status "6.1 Stapling the installer package..."
xcrun stapler staple "$SIGNED_PKG_NAME"

print_success "PKG stapled successfully"

# Cleanup temporary files
print_status "=== CLEANUP ==="
print_status "Removing temporary zip files..."
[ -n "$ZIP_VST3" ] && [ -f "$ZIP_VST3" ] && rm "$ZIP_VST3"
[ -n "$ZIP_AU" ] && [ -f "$ZIP_AU" ] && rm "$ZIP_AU"

print_success "=== NOTARIZATION PROCESS COMPLETED ==="
print_status "Final notarized installer: $SIGNED_PKG_NAME"
print_status "You can now distribute this installer safely on macOS"
