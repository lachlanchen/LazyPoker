#!/usr/bin/env bash
set -euo pipefail

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
project_dir=$(CDPATH= cd -- "$script_dir/.." && pwd -P)
lock_file="$project_dir/config/model-sources.lock"
install_root="$project_dir/.local/models/sources"
checked=0

fail() { echo "FAIL $*" >&2; exit 1; }

[[ ! -L $lock_file && -f $lock_file ]] || fail "lock manifest is missing or symbolic"
for path in "$project_dir/.local" "$project_dir/.local/models" "$install_root"; do
  [[ ! -L $path ]] || fail "$path is a symbolic link"
  [[ ! -e $path || -d $path ]] || fail "$path is not a directory"
done
if [[ ! -d $install_root ]]; then
  echo "No optional sources installed. Run scripts/setup-models.sh --list."
  exit 0
fi
resolved_root=$(realpath -e -- "$install_root")
[[ $resolved_root == "$project_dir/.local/models/sources" ]] || fail "install root escaped the repository"

while IFS='|' read -r name _game source_url commit _license _size _status; do
  [[ -z $name || $name == \#* ]] && continue
  [[ $name =~ ^[a-z0-9][a-z0-9.-]*$ ]] || fail "invalid source name: $name"
  [[ $source_url =~ ^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+\.git$ ]] || fail "unsupported source URL for $name"
  [[ $commit =~ ^[0-9a-f]{40}$ ]] || fail "invalid commit checksum for $name"
  destination="$install_root/$name"
  [[ ! -L $destination ]] || fail "$destination is a symbolic link"
  [[ -e $destination ]] || continue
  [[ -d $destination ]] || fail "$destination is not a directory"
  [[ ! -L $destination/.git ]] || fail "$destination/.git is a symbolic link"
  [[ -d $destination/.git ]] || fail "$destination is not a Git source checkout"
  resolved_destination=$(realpath -e -- "$destination")
  [[ $resolved_destination == "$install_root/$name" ]] || fail "$name escaped the install root"
  checked=$((checked + 1))
  actual_origin=$(git -C "$destination" remote get-url origin)
  actual_commit=$(git -C "$destination" rev-parse HEAD)
  [[ $actual_origin == "$source_url" ]] || fail "$name origin: $actual_origin"
  [[ $actual_commit == "$commit" ]] || fail "$name commit: $actual_commit"
  if ! git -C "$destination" diff --quiet --ignore-submodules --; then fail "$name has modified tracked files"; fi
  echo "OK $name $actual_commit"
done < "$lock_file"

if ((checked == 0)); then
  echo "No optional sources installed. Run scripts/setup-models.sh --list."
else
  echo "Verified $checked installed source adapter(s)."
fi
