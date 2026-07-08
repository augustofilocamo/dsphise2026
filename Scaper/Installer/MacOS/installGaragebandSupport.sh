#!/bin/sh
# ensure plugin directory actually exists
sudo -u $USER mkdir -p $HOME/Library/Application\ Support/Sampleson/Scaper/
sudo -u $USER mkdir -p /Users/$USER/Library/Containers/com.apple.garageband10/Data/Library/Application\ Support/Sampleson/Scaper/

# move and sync files from temporary payload to real plugin directory
/usr/bin/rsync -avurpE /Library/Application\ Support/Sampleson/Scaper/ $HOME/Library/Application\ Support/Sampleson/Scaper/
/usr/bin/rsync -avurpE --remove-source-files /Library/Application\ Support/Sampleson/Scaper/ /Users/$USER/Library/Containers/com.apple.garageband10/Data/Library/Application\ Support/Sampleson/Scaper/

# ensure permissions are recursively set to current user for plugin directory
sudo find $HOME/Library/Application\ Support/Sampleson/ -type d -user root -exec sudo chown -R $USER: {} +
sudo find /Users/$USER/Library/Containers/com.apple.garageband10/Data/Library/Application\ Support/Sampleson/Scaper/ -type d -user root -exec sudo chown -R $USER: {} +

# remove temporary folder
find /Library/Application\ Support/Sampleson/ -type d -empty -delete

exit 0
