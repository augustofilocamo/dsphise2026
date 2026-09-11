#!/bin/sh
DEST="$HOME/Library/Application Support/Sampleson/Backgrounds/Semantic_s"
ZIP="/Library/Application Support/Sampleson/Backgrounds/Semantic_s.zip"

sudo -u "$USER" mkdir -p "$DEST"
sudo -u "$USER" ditto -x -k "$ZIP" "$DEST"

# dueño de las carpetas (si quedó algo de root)
sudo find "$HOME/Library/Application Support/Sampleson" -user root -exec chown -R "$USER" {} +

rm -f "$ZIP"
exit 0