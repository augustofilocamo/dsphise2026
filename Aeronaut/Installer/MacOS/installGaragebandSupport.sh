#!/bin/sh
# ensure plugin directory actually exists
sudo -u $USER mkdir -p $HOME/Library/Application\ Support/Sampleson/Boomcha/
sudo -u $USER mkdir -p /Users/$USER/Library/Containers/com.apple.garageband10/Data/Library/Application\ Support/Sampleson/Boomcha/

# move and sync files from temporary payload to real plugin directory
/usr/bin/rsync -avurpE /Library/Application\ Support/Sampleson/Boomcha/ $HOME/Library/Application\ Support/Sampleson/Boomcha/
/usr/bin/rsync -avurpE --remove-source-files /Library/Application\ Support/Sampleson/Boomcha/ /Users/$USER/Library/Containers/com.apple.garageband10/Data/Library/Application\ Support/Sampleson/Boomcha/

# ensure permissions are recursively set to current user for plugin directory
sudo find $HOME/Library/Application\ Support/Sampleson/ -type d -user root -exec sudo chown -R $USER: {} +
sudo find /Users/$USER/Library/Containers/com.apple.garageband10/Data/Library/Application\ Support/Sampleson/Boomcha/ -type d -user root -exec sudo chown -R $USER: {} +

# remove temporary folder
find /Library/Application\ Support/Sampleson/ -type d -empty -delete

exit 0
