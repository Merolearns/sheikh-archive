#!/bin/bash
set -u
SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)" || exit 1
cd "$SCRIPT_DIR" || exit 1

if [[ ! -f "Preview/archive_server.py" || ! -f "Preview/archive.html" ]]; then
  echo "ERROR: Preview/archive_server.py or Preview/archive.html was not found."
  echo "Keep this launcher in the archive's top-level folder."
  read -r -p "Press Return to close..." _
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 is required to start this local archive viewer."
  echo "Install Python 3 from https://www.python.org/downloads/macos/"
  echo "Then run this launcher again."
  read -r -p "Press Return to close..." _
  exit 1
fi

exec python3 "Preview/archive_server.py"
