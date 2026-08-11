#!/usr/bin/env bash
set -euo pipefail

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
project_dir=$(CDPATH= cd -- "$script_dir/.." && pwd -P)
test_root=$(mktemp -d "${TMPDIR:-/tmp}/poker-model-safety.XXXXXX")
trap 'rm -rf -- "$test_root"' EXIT

make_fixture() {
  local name=$1
  mkdir -p "$test_root/$name/scripts" "$test_root/$name/config"
  cp -- "$project_dir/scripts/setup-models.sh" "$project_dir/scripts/verify-models.sh" "$test_root/$name/scripts/"
  cp -- "$project_dir/config/model-sources.lock" "$test_root/$name/config/"
}

make_fixture quarantined
if "$test_root/quarantined/scripts/setup-models.sh" brl >"$test_root/brl.out" 2>&1; then
  echo "BRL unexpectedly passed the source allowlist" >&2
  exit 1
fi
grep -q 'Unknown or quarantined source: brl' "$test_root/brl.out"
if find "$test_root/quarantined/.local" -name .git -print -quit | grep -q .; then
  echo "A quarantined source created a checkout" >&2
  exit 1
fi

make_fixture symlink
mkdir -p "$test_root/escape"
ln -s "$test_root/escape" "$test_root/symlink/.local"
if "$test_root/symlink/scripts/setup-models.sh" open-spiel >"$test_root/setup-symlink.out" 2>&1; then
  echo "Setup followed a symbolic-link model root" >&2
  exit 1
fi
grep -q 'is a symbolic link' "$test_root/setup-symlink.out"
if "$test_root/symlink/scripts/verify-models.sh" >"$test_root/verify-symlink.out" 2>&1; then
  echo "Verification followed a symbolic-link model root" >&2
  exit 1
fi
grep -q 'is a symbolic link' "$test_root/verify-symlink.out"

make_fixture destination
mkdir -p "$test_root/destination/.local/models/sources" "$test_root/destination-escape"
ln -s "$test_root/destination-escape" "$test_root/destination/.local/models/sources/open-spiel"
if "$test_root/destination/scripts/setup-models.sh" open-spiel >"$test_root/setup-destination.out" 2>&1; then
  echo "Setup followed a symbolic-link source destination" >&2
  exit 1
fi
grep -q 'is a symbolic link' "$test_root/setup-destination.out"
if "$test_root/destination/scripts/verify-models.sh" >"$test_root/verify-destination.out" 2>&1; then
  echo "Verification followed a symbolic-link source destination" >&2
  exit 1
fi
grep -q 'is a symbolic link' "$test_root/verify-destination.out"

make_fixture incomplete
mkdir -p "$test_root/incomplete/.local/models/sources/open-spiel"
if "$test_root/incomplete/scripts/verify-models.sh" >"$test_root/verify-incomplete.out" 2>&1; then
  echo "Verification accepted a non-Git source destination" >&2
  exit 1
fi
grep -q 'is not a Git source checkout' "$test_root/verify-incomplete.out"

echo "Model-source quarantine and symbolic-link checks passed."
