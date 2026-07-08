#!/bin/bash

# Twinkle Mac Installer Notarization - Correct Flow
# Follows the exact steps: sign → notarize file by file → create PKG → sign PKG → notarize PKG → wait → staple

set -e

# Configuration - UPDATE THESE AS NEEDED
DEVELOPER_ID_APPLICATION="Developer ID Application: AUGUSTO FILOCAMO (3987UA4K7Q)"
DEVELOPER_ID_INSTALLER="Developer ID Installer: AUGUSTO FILOCAMO"
KEYCHAIN_PROFILE="notarytool2023"
PROJECT_NAME="Twinkle"
VERSION="1.0.1"

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

# Function to wait for notarization completion
wait_for_notarization() {
    local submission_id="$1"
    local description="$2"
    
    print_status "Waiting for $description notarization to complete..."
    print_warning "This may take several minutes..."
    
    xcrun notarytool wait --keychain-profile "$KEYCHAIN_PROFILE" "$submission_id"
    
    print_success "$description notarization completed"
}

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_status "Working directory: $(pwd)"
print_status "=== TWINKLE MAC NOTARIZATION - CORRECT FLOW ==="

# STEP 1: Sign all applications
print_status "=== STEP 1: SIGNING APPLICATIONS ==="

print_status "1.1 Signing Twinkle.app..."
if [ -d "Twinkle.app" ]; then
    codesign --deep --force --options runtime --sign "$DEVELOPER_ID_APPLICATION" "Twinkle.app"
    print_success "Twinkle.app signed successfully"
else
    print_error "Twinkle.app not found"
    exit 1
fi

print_status "1.2 Signing Twinkle.vst3..."
if [ -d "Twinkle.vst3" ]; then
    codesign --deep --force --options runtime --sign "$DEVELOPER_ID_APPLICATION" "Twinkle.vst3"
    print_success "Twinkle.vst3 signed successfully"
else
    print_warning "Twinkle.vst3 not found, skipping..."
fi

print_status "1.3 Signing Twinkle.component..."
if [ -d "Twinkle.component" ]; then
    codesign --deep --force --options runtime --sign "$DEVELOPER_ID_APPLICATION" "Twinkle.component"
    print_success "Twinkle.component signed successfully"
else
    print_warning "Twinkle.component not found, skipping..."
fi

# STEP 2: Notarize each file individually
print_status "=== STEP 2: NOTARIZING FILES INDIVIDUALLY ==="

# Create individual zip files for each component
print_status "2.1 Creating individual zip files..."

# Twinkle.app
print_status "2.1.1 Creating zip for Twinkle.app..."
ZIP_APP="${PROJECT_NAME}-app-${VERSION}.zip"
if [ -f "$ZIP_APP" ]; then
    rm "$ZIP_APP"
fi
zip -r "$ZIP_APP" Twinkle.app

# Twinkle.vst3
if [ -d "Twinkle.vst3" ]; then
    print_status "2.1.2 Creating zip for Twinkle.vst3..."
    ZIP_VST3="${PROJECT_NAME}-vst3-${VERSION}.zip"
    if [ -f "$ZIP_VST3" ]; then
        rm "$ZIP_VST3"
    fi
    zip -r -X "$ZIP_VST3" Twinkle.vst3 -x "*/__MACOSX/*" "*/\.DS_Store" "*/\._*"
fi

# Twinkle.component
if [ -d "Twinkle.component" ]; then
    print_status "2.1.3 Creating zip for Twinkle.component..."
    ZIP_AU="${PROJECT_NAME}-au-${VERSION}.zip"
    if [ -f "$ZIP_AU" ]; then
        rm "$ZIP_AU"
    fi
    zip -r -X "$ZIP_AU" Twinkle.component -x "*/__MACOSX/*" "*/\.DS_Store" "*/\._*"
fi

# Submit each for notarization and wait for completion
print_status "2.2 Submitting files for notarization..."

print_status "2.2.1 Submitting Twinkle.app for notarization..."
SUBMISSION_APP=$(xcrun notarytool submit --keychain-profile "$KEYCHAIN_PROFILE" "$ZIP_APP" --wait)
print_success "Twinkle.app notarization completed"

if [ -f "$ZIP_VST3" ]; then
    print_status "2.2.2 Submitting Twinkle.vst3 for notarization..."
    SUBMISSION_VST3=$(xcrun notarytool submit --keychain-profile "$KEYCHAIN_PROFILE" "$ZIP_VST3" --wait)
    print_success "Twinkle.vst3 notarization completed"
fi

if [ -f "$ZIP_AU" ]; then
    print_status "2.2.3 Submitting Twinkle.component for notarization..."
    SUBMISSION_AU=$(xcrun notarytool submit --keychain-profile "$KEYCHAIN_PROFILE" "$ZIP_AU" --wait)
    print_success "Twinkle.component notarization completed"
fi

print_success "All applications notarized successfully"

# Staple the applications
print_status "2.3 Stapling applications..."
xcrun stapler staple "Twinkle.app"
if [ -d "Twinkle.vst3" ]; then
    xcrun stapler staple "Twinkle.vst3"
fi
if [ -d "Twinkle.component" ]; then
    xcrun stapler staple "Twinkle.component"
fi

print_success "All applications stapled successfully"

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

SUBMISSION_PKG=$(xcrun notarytool submit --keychain-profile "$KEYCHAIN_PROFILE" "$SIGNED_PKG_NAME" --wait)

print_success "PKG notarization completed"

# STEP 6: Staple the PKG
print_status "=== STEP 6: STAPLING THE PKG ==="
print_status "6.1 Stapling the installer package..."
xcrun stapler staple "$SIGNED_PKG_NAME"

print_success "PKG stapled successfully"

# Cleanup temporary files
print_status "=== CLEANUP ==="
print_status "Removing temporary zip files..."
if [ -f "$ZIP_APP" ]; then
    rm "$ZIP_APP"
fi
if [ -f "$ZIP_VST3" ]; then
    rm "$ZIP_VST3"
fi
if [ -f "$ZIP_AU" ]; then
    rm "$ZIP_AU"
fi

print_success "=== NOTARIZATION PROCESS COMPLETED ==="
print_status "Final notarized installer: $SIGNED_PKG_NAME"
print_status "You can now distribute this installer safely on macOS" 