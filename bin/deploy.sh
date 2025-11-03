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

# Option defaults
FORCE=0
DRY_RUN=0
BACKUP_ONLY=0
LOCAL_BACKUP_ONLY=0

# Parse options
while [[ $# -gt 0 ]]; do
  case "$1" in
    --force|-f)
      FORCE=1
      shift
      ;;
    --dry-run|-n)
      DRY_RUN=1
      shift
      ;;
    --local-backup-only|-l)
      LOCAL_BACKUP_ONLY=1
      shift
      ;;
    --backup-only|-b)
      BACKUP_ONLY=1
      shift
      ;;
    --help|-h)
      cat <<EOF
Copy the website to our webhost (w/checks & backups)

Usage: $(basename "$0") [options]

This is always safe to run.  It will verify that you have the correct setup
(including verifying that you're both up to date WRT the remote repo, and that
you've checked in all your local changes), and store a backup of the current
live site (stored both remotely and locally).

Options:
  --force, -f             Continue on check failures for things that are not fatal (warnings instead of exit)
  --dry-run, -n           Don't execute commands; print what would run (prefixed with "DRY RUN:")
  --backup-only, -b       Only perform backups (local and remote unless --local-backup-only is set)
  --local-backup-only,-l  Only perform the local backup; skip the remote backup
  --help, -h              Show this help message

Notes:
  --force does not bypass checks that will lead to the script not working at all.
EOF
      exit 0
      ;;
    --)
      shift
      break
      ;;
    -*|--*)
      echo "Unknown option: $1"
      exit 1
      ;;
    *)
      # stop parsing on first non-option
      break
      ;;
  esac
done

prefix() {
  if [ "$DRY_RUN" = "1" ]; then
    printf "DRY RUN: %s\n" "$1"
  else
    printf "%s\n" "$1"
  fi
}

warn_or_exit() {
  # $1 = message
  # $2 = is_site_check (1 = site/subdir check which cannot be bypassed)
  # If FORCE or DRY_RUN is set, non-site checks become warnings
  if [ "$2" = "1" ]; then
    # site/subdir checks always fatal
    prefix "Error: $1"
    add_blocker "$1"
    exit 1
  fi

  if { [ "$FORCE" = "1" ] || [ "$DRY_RUN" = "1" ]; } && [ "$2" != "1" ]; then
    prefix "Warning: $1"
    add_blocker "$1"
  else
    prefix "Error: $1"
    add_blocker "$1"
    exit 1
  fi
}

# Collect any checks that would block deployment (used for dry-run messaging)
BLOCKERS=()
add_blocker() {
  BLOCKERS+=("$1")
}

run_cmd() {
  # Run a command string. If DRY_RUN, print it prefixed and do not execute.
  # $1 = command string
  if [ "$DRY_RUN" = "1" ]; then
    prefix "$1"
    return 0
  else
    eval "$1"
    return $?
  fi
}

# Verify that we have lftp installed.  This cannot be bypassed with --force
# as we need lftp to proceed with a working deployment
if ! command -v lftp &> /dev/null; then
  warn_or_exit "lftp is not installed. Please install lftp and try again." 0
fi

# This cannot be bypassed with --force or --dry-run, as we need these variables
# to proceed with a working deployment

if [ -f .env ]; then
  source .env
else
  warn_or_exit ".env file not found. Please create a .env file with the correct variables; see dotenv.example for reference." 0
  if ! [ "$DRY_RUN" = "1" ]; then
    exit 1
  fi
fi

if [ -z "$SLOTTSFJELLET_URL" ]; then
  # This is a site/subdir check and cannot be bypassed by --force
  warn_or_exit "SLOTTSFJELLET_URL is not set in .env file" 1
fi

if [ -z "$SLOTTSFJELLET_WWW_SUBDIR" ]; then
  # This is a site/subdir check and cannot be bypassed by --force
  warn_or_exit "SLOTTSFJELLET_WWW_SUBDIR is not set in .env file" 1
fi

if [ ! -z "$LFTP_PASSWORD" ]; then
  export LFTP_PASSWORD
  LFTP_EXTRA_OPTS="--env-password"
else
  prefix "Warning: LFTP_PASSWORD is not set in .env file; you will be prompted for the password several times during the deploy process"
  LFTP_EXTRA_OPTS=""
fi


# Verify that we are in the correct git branch
EXPECTED_BRANCH="main"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]; then
  warn_or_exit "You are not on the $EXPECTED_BRANCH branch." 0
fi

# Verify that the local git branch has no uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  warn_or_exit "You have uncommitted changes. Please commit or stash them before deploying." 0
fi

# Verify that the local git branch is up to date with remote
if [ "$(git rev-parse HEAD)" != "$(git rev-parse @{u} 2>/dev/null)" ]; then
  warn_or_exit 'Your local branch is not up to date with remote. Please "git pull" the latest changes before deploying.' 0
fi

# Verify that remote is up to date with the local git branch
git fetch
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  warn_or_exit 'Your local branch contains changes that have not been pushed to the remote. Please "git push" the latest changes before deploying.' 0
fi

# Verify that the local eleventy build is up to date by building to a temp directory and comparing
TEMP_DIR=$(mktemp -d)
npx @11ty/eleventy --output=$TEMP_DIR
if ! diff -r _site/ $TEMP_DIR > /dev/null; then
  # This is something we may want to bypass with --force or --dry-run
  if [ "$FORCE" = "1" ] || [ "$DRY_RUN" = "1" ]; then
    prefix "Warning: The local eleventy build is different from a fresh build. Continuing because --force or --dry-run was given. Build command: npx @11ty/eleventy"
  else
    diff -u -r _site/ $TEMP_DIR
    prefix "----------"
    prefix "Error: The local eleventy build is different from a fresh build.  Please build the site before deploying, or investigate the differences.  Build command: npx @11ty/eleventy"
    rm -rf $TEMP_DIR
    exit 1
  fi
fi
rm -rf $TEMP_DIR

# Create a timestamp for the backup directory
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# Mirror the live site to a backup directory locally, in _backups/slottsfjellet-YYYYMMDD-HHMMSS
mkdir -p _backups
CMD_LOCAL_BACKUP="lftp -c \"set ssl:verify-certificate no; open $LFTP_EXTRA_OPTS $SLOTTSFJELLET_URL; mirror --exclude='^Wordpress/.*' $SLOTTSFJELLET_WWW_SUBDIR _backups/slottsfjellet-$TIMESTAMP\""
run_cmd "$CMD_LOCAL_BACKUP"
if [ $? -ne 0 ] && [ "$DRY_RUN" != "1" ]; then
  warn_or_exit "Failed to create local backup" 0
fi

# If the local backup just created is identical to the current _site, skip remote backup and deploy unless --force is set
IDENTICAL=0
LOCAL_BACKUP_PATH="_backups/slottsfjellet-$TIMESTAMP"
if [ "$DRY_RUN" = "1" ]; then
  prefix "Would compare _site/ with $LOCAL_BACKUP_PATH to decide whether remote backup/deploy is needed."
  IDENTICAL=0
else
  if diff -r -q _site/ "$LOCAL_BACKUP_PATH" > /dev/null 2>&1; then
    IDENTICAL=1
    prefix "Local backup is identical to _site (all files present match)."
  else
    IDENTICAL=0
  fi
fi

if [ "$IDENTICAL" = "1" ] && [ "$FORCE" != "1" ]; then
  prefix "Remote site matches the current _site. Skipping remote backup and deployment. Use --force to override."
  exit 0
fi


# Mirror the local backup to a backup directory on the server, in ~/slottsfjellet-backups/slottsfjellet-YYYYMMDD-HHMMSS
# I've been unable to get a remote mirror to work, so we do it by way of the local copy.
if [ "$LOCAL_BACKUP_ONLY" = "1" ]; then
  prefix "Skipping remote backup due to --local-backup-only."
else
  CMD_REMOTE_BACKUP="lftp -c \"set ssl:verify-certificate no; open $LFTP_EXTRA_OPTS $SLOTTSFJELLET_URL; mkdir slottsfjellet-backups/slottsfjellet-$TIMESTAMP; mirror -R ./_backups/slottsfjellet-$TIMESTAMP slottsfjellet-backups/slottsfjellet-$TIMESTAMP\""
  run_cmd "$CMD_REMOTE_BACKUP"
  if [ $? -ne 0 ] && [ "$DRY_RUN" != "1" ]; then
    warn_or_exit "Failed to create remote backup" 0
  fi
fi

# If backup-only was requested, skip the deploy step
if [ "$BACKUP_ONLY" = "1" ]; then
  prefix "Backup-only mode; skipping deployment step."
  prefix "Local backup would be at _backups/slottsfjellet-$TIMESTAMP"
  prefix "Remote backup would be at ~/slottsfjellet-backups/slottsfjellet-$TIMESTAMP"
  [ "$DRY_RUN" = "1" ] && prefix "DRY RUN completed." || prefix "Backup completed."
  exit 0
fi

# Mirror the local _site directory to the server
CMD_DEPLOY="lftp -c \"set ssl:verify-certificate no; open $LFTP_EXTRA_OPTS $SLOTTSFJELLET_URL; mirror -R _site/ $SLOTTSFJELLET_WWW_SUBDIR\""
run_cmd "$CMD_DEPLOY"
if [ $? -ne 0 ] && [ "$DRY_RUN" != "1" ]; then
  warn_or_exit "Failed to deploy site" 0
fi

# Print a success message
if [ "$DRY_RUN" = "1" ]; then
  if [ ${#BLOCKERS[@]} -eq 0 ] || { [ "$FORCE" = "1" ] && [ "$DRY_RUN" = "1" ]; }; then
    prefix "Deployment would be successful!"
  else
    prefix "Deployment would NOT be successful. Reasons:" 
    for b in "${BLOCKERS[@]}"; do
      prefix "  - $b"
    done
  fi
  prefix "Local backup would be at _backups/slottsfjellet-$TIMESTAMP"
  if [ "$LOCAL_BACKUP_ONLY" = "1" ]; then
    prefix "Remote backup skipped due to --local-backup-only"
  else
    prefix "Remote backup would be at ~/slottsfjellet-backups/slottsfjellet-$TIMESTAMP"
  fi
  prefix "Site would be deployed to $SLOTTSFJELLET_URL/$SLOTTSFJELLET_WWW_SUBDIR"
else
  prefix "Deployment successful!"
  prefix "Local backup created at _backups/slottsfjellet-$TIMESTAMP"
  prefix "Remote backup created at ~/slottsfjellet-backups/slottsfjellet-$TIMESTAMP"
  prefix "Site deployed to $SLOTTSFJELLET_URL/$SLOTTSFJELLET_WWW_SUBDIR"
fi
