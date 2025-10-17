#!/bin/bash


#
# Deploy the site to the production server
#
# The .env file must contain the following variables:
#
# SLOTTSFJELLET_URL - The sftp URL of the server, e.g. sftp://user@host
# SLOTTSFJELLET_WWW_SUBDIR - The subdirectory on the server to deploy to, e.g. www
# LFTP_PASSWORD - The password for the sftp user; if not set, you will be prompted for the password
#
# The script will:
# 1. Verify that we are in the correct git branch (main)
# 2. Verify that the local git branch has no uncommitted changes
# 3. Verify that the local git branch is up to date with remote
# 4. Verify that the local eleventy build is up to date by building to a temp directory and comparing
# 5. Create a timestamp for the backup directory
# 6. Mirror the live site to a backup directory locally, in _backups/slottsfjellet-YYYYMMDD-HHMMSS
# 7. Mirror the local backup to a backup directory on the server, in ~/slottsfjellet-backups/slottsfjellet-YYYYMMDD-HHMMSS
# 8. Mirror the local _site directory to the server
# 9. Print a success message

# Verify that we have lftp installed
if ! command -v lftp &> /dev/null; then
  echo "Error: lftp is not installed. Please install lftp and try again."
  exit 1
fi

if [ ! -f .env ]; then
  echo "Error: .env file not found. Please create a .env file with the correct variables; see dotenv.example for reference."
  exit 1
fi

# Load environment variables from .env file
source .env

if [ -z "$SLOTTSFJELLET_URL" ]; then
  echo "Error: SLOTTSFJELLET_URL is not set in .env file"
  exit 1
fi

if [ -z "$SLOTTSFJELLET_WWW_SUBDIR" ]; then
  echo "Error: SLOTTSFJELLET_WWW_SUBDIR is not set in .env file"
  exit 1
fi

if [ ! -z "$LFTP_PASSWORD" ]; then
  export LFTP_PASSWORD
  LFTP_EXTRA_OPTS="--env-password"
else
  echo "Warning: LFTP_PASSWORD is not set in .env file; you will be prompted for the password several times during the deploy process"
  LFTP_EXTRA_OPTS=""
fi


# Verify that we are in the correct git branch
EXPECTED_BRANCH="main"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]; then
  echo "Error: You are not on the $EXPECTED_BRANCH branch."
  exit 1
fi

# Verify that the local git branch has no uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: You have uncommitted changes. Please commit or stash them before deploying."
  exit 1
fi

# Verify that the local git branch is up to date with remote
if [ "$(git rev-parse HEAD)" != "$(git rev-parse @{u})" ]; then
  echo "Error: Your local branch is not up to date with remote. Please pull the latest changes before deploying."
  exit 1
fi

# Verify that the local eleventy build is up to date by building to a temp directory and comparing
TEMP_DIR=$(mktemp -d)
npx @11ty/eleventy --output=$TEMP_DIR
if ! diff -r _site/ $TEMP_DIR > /dev/null; then
  echo "Error: The local eleventy build is different from a fresh build.  Please build the site before deploying, or investigate the differences.  Build command: npx @11ty/eleventy"
  rm -rf $TEMP_DIR
  exit 1
fi
rm -rf $TEMP_DIR

# Create a timestamp for the backup directory
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# Mirror the live site to a backup directory locally, in _backups/slottsfjellet-YYYYMMDD-HHMMSS
mkdir -p _backups
lftp -c "set ssl:verify-certificate no; open $LFTP_EXTRA_OPTS $SLOTTSFJELLET_URL; mirror --exclude='^Wordpress/.*' $SLOTTSFJELLET_WWW_SUBDIR _backups/slottsfjellet-$TIMESTAMP"
if [ $? -ne 0 ]; then
  echo "Error: Failed to create local backup"
  exit 1
fi


# Mirror the local backup to a backup directory on the server, in ~/slottsfjellet-backups/slottsfjellet-YYYYMMDD-HHMMSS
# I've been unable to get a remote mirror to work, so we do it by way of the local copy.
lftp -c "set ssl:verify-certificate no; open $LFTP_EXTRA_OPTS $SLOTTSFJELLET_URL; mkdir slottsfjellet-backups/slottsfjellet-$TIMESTAMP; mirror -R ./_backups/slottsfjellet-$TIMESTAMP slottsfjellet-backups/slottsfjellet-$TIMESTAMP"
if [ $? -ne 0 ]; then
  echo "Error: Failed to create remote backup"
  exit 1
fi

# Mirror the local _site directory to the server
lftp -c "set ssl:verify-certificate no; open $LFTP_EXTRA_OPTS $SLOTTSFJELLET_URL; mirror -R _site/ $SLOTTSFJELLET_WWW_SUBDIR"
if [ $? -ne 0 ]; then
  echo "Error: Failed to deploy site"
  exit 1
fi

# Print a success message
echo "Deployment successful!"
echo "Local backup created at backups/slottsfjellet-$TIMESTAMP"
echo "Remote backup created at ~/slottsfjellet-backups/slottsfjellet-$TIMESTAMP"
echo "Site deployed to $SLOTTSFJELLET_URL/$SLOTTSFJELLET_WWW_SUBDIR"
