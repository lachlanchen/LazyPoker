#!/usr/bin/env bash
set -euo pipefail

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
project_dir=$(CDPATH= cd -- "$script_dir/.." && pwd -P)
lock_file="$project_dir/config/model-sources.lock"
install_root="$project_dir/.local/models/sources"

fail() { echo "Refusing unsafe model-source setup: $*" >&2; exit 1; }

ensure_plain_directory() {
  local path=$1
  [[ ! -L $path ]] || fail "$path is a symbolic link"
  [[ ! -e $path || -d $path ]] || fail "$path is not a directory"
  mkdir -p -- "$path"
  [[ ! -L $path && -d $path ]] || fail "$path did not resolve to a plain directory"
}

prepare_install_root() {
  [[ ! -L $lock_file && -f $lock_file ]] || fail "lock manifest is missing or symbolic"
  ensure_plain_directory "$project_dir/.local"
  ensure_plain_directory "$project_dir/.local/models"
  ensure_plain_directory "$install_root"
  local resolved_root
  resolved_root=$(realpath -e -- "$install_root")
  [[ $resolved_root == "$project_dir/.local/models/sources" ]] || fail "install root escaped the repository"
}

usage() {
  echo "Usage: $0 --list | --all | NAME [NAME ...]"
  echo "Clones allowlisted source adapters only; it never downloads model weights or datasets."
}

list_sources() {
  awk -F '|' '!/^#/ && NF { printf "%-16s %-9s %-15s ~%s MiB\n", $1, $2, $7, $6 }' "$lock_file"
}

if (($# == 0)); then usage; exit 2; fi
if [[ $1 == --list ]]; then list_sources; exit 0; fi

targets=("$@")
if [[ $1 == --all ]]; then
  mapfile -t targets < <(awk -F '|' '!/^#/ && NF { print $1 }' "$lock_file")
fi

prepare_install_root
for target_name in "${targets[@]}"; do
  [[ $target_name =~ ^[a-z0-9][a-z0-9.-]*$ ]] || fail "invalid source name: $target_name"
  row=$(awk -F '|' -v wanted="$target_name" '!/^#/ && $1 == wanted { print; exit }' "$lock_file")
  if [[ -z $row ]]; then echo "Unknown or quarantined source: $target_name" >&2; exit 2; fi
  IFS='|' read -r name _game source_url commit _license _size _status <<< "$row"
  [[ $name == "$target_name" ]] || fail "manifest name mismatch"
  [[ $source_url =~ ^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+\.git$ ]] || fail "unsupported source URL for $name"
  [[ $commit =~ ^[0-9a-f]{40}$ ]] || fail "invalid commit checksum for $name"
  destination="$install_root/$name"
  [[ ! -L $destination ]] || fail "$destination is a symbolic link"
  if [[ -e $destination && ! -d $destination/.git ]]; then fail "non-git destination: $destination"; fi
  if [[ ! -d $destination/.git ]]; then
    git init --quiet "$destination"
    git -C "$destination" remote add origin "$source_url"
  fi
  [[ ! -L $destination/.git && -d $destination/.git ]] || fail "$destination/.git is not a plain directory"
  resolved_destination=$(realpath -e -- "$destination")
  [[ $resolved_destination == "$install_root/$name" ]] || fail "destination escaped the install root"
  actual_origin=$(git -C "$destination" remote get-url origin)
  [[ $actual_origin == "$source_url" ]] || fail "origin mismatch for $name: $actual_origin"
  git -C "$destination" fetch --quiet --depth 1 origin "$commit"
  git -C "$destination" checkout --quiet --detach FETCH_HEAD
  actual_commit=$(git -C "$destination" rev-parse HEAD)
  [[ $actual_commit == "$commit" ]] || fail "commit checksum mismatch for $name"
  echo "Verified $name at $actual_commit"
done

echo "Source adapters are under $install_root. No weights or datasets were downloaded."
