#!/bin/sh
# ensure plugin directory actually exists
sudo -u $USER mkdir -p $HOME/Library/Application\ Support/Sampleson/Backgrounds/

# move and sync files from temporary payload to real plugin directory
/usr/bin/rsync -avurpE /Library/Application\ Support/Sampleson/Backgrounds/ $HOME/Library/Application\ Support/Sampleson/Backgrounds/

# ensure permissions are recursively set to current user for plugin directory
sudo find $HOME/Library/Application\ Support/Sampleson/ -type d -user root -exec sudo chown -R $USER: {} +

# remove temporary folder
find /Library/Application\ Support/Sampleson/ -type d -empty -delete

exit 0
