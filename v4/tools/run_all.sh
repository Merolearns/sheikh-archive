#!/bin/bash
# Build, sync testroot, serve it, run HTTP + behaviour tests. Usage: bash tools/run_all.sh [shots]
set -u
V4=$(cd "$(dirname "$0")/.." && pwd)
TR=$V4/testroot
cd "$V4" || exit 1
python3 build.py > "$TR/build.out" 2>&1 || { echo "BUILD FAILED"; tail "$TR/build.out"; exit 1; }
rm -rf "$TR/Preview" && cp -a build/Preview "$TR/Preview"
cd "$TR" && BROWSER=true python3 -u Preview/archive_server.py > server.log 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 2
python3 "$V4/tools/http_tests.py" http://127.0.0.1:8765 > "$TR/http-tests.out" 2>&1
echo "HTTP: $(grep -c ^PASS "$TR/http-tests.out") pass, $(grep -c "^FAIL " "$TR/http-tests.out") fail"
node "$V4/tools/behavior_tests.js" http://127.0.0.1:8765 > "$TR/behavior-tests.out" 2>&1 || echo "BEHAVIOUR exited $? (a failure or a crash), see behavior-tests.out"
echo "BEHAVIOUR: $(grep -c ^PASS "$TR/behavior-tests.out") pass, $(grep -c "^FAIL " "$TR/behavior-tests.out") fail"
if [ "${1:-}" = shots ]; then
  node "$V4/tools/shots.js" http://127.0.0.1:8765 > "$TR/shots.out" 2>&1 || echo "SHOTS exited $? (a failure or a crash), see shots.out"
  echo "SHOTS: $(tail -1 "$TR/shots.out")"
fi
echo DONE
