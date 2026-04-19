#!/bin/sh

if [ ! -d venv ] && ! python3 -m venv venv; then   # ← simpler logic
  echo "ERROR: No venv, and unable to create one" >&2   # ← >&2 not 2>&1
  exit 1
fi

. venv/bin/activate
pip install -q pypdf reportlab
exec python3 tile_cards.py "$@"
