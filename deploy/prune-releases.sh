#!/usr/bin/env bash
set -euo pipefail

releases_dir=${1:?release directory required}
current_target=${2:-}
previous_target=${3:-}
[[ -d "$releases_dir" && ! -L "$releases_dir" ]] || {
  echo 'Release directory must be a real directory' >&2
  exit 1
}
root=$(cd -- "$releases_dir" && pwd -P)
[[ $root != / && $(basename "$root") == releases ]] || {
  echo 'Refusing to prune outside a releases directory' >&2
  exit 1
}

resolve_target() {
  local target=${1:-} resolved name
  [[ -n $target ]] || return 0
  resolved=$(cd -- "$target" 2>/dev/null && pwd -P) || {
    echo 'Protected release target does not exist' >&2
    return 1
  }
  name=$(basename "$resolved")
  [[ -d $resolved && $(dirname "$resolved") == "$root" && $name =~ ^[a-f0-9]{40}$ ]] || {
    echo 'Protected release target is outside the releases directory' >&2
    return 1
  }
  printf '%s' "$resolved"
}

current=$(resolve_target "$current_target")
previous=$(resolve_target "$previous_target")
releases=()
while IFS=$'\t' read -r _ release; do
  [[ -n $release ]] && releases+=("$release")
done < <(
  for release in "$root"/*; do
    [[ -d $release && ! -L $release ]] || continue
    name=${release##*/}
    [[ $name =~ ^[a-f0-9]{40}$ ]] || continue
    modified=$(stat -c %Y "$release" 2>/dev/null || stat -f %m "$release" 2>/dev/null || printf '0')
    printf '%s\t%s\n' "$modified" "$release"
  done | sort -t $'\t' -k1,1nr -k2,2
)

is_kept() {
  local candidate=$1 index
  [[ -n $current && $candidate == "$current" ]] && return 0
  [[ -n $previous && $candidate == "$previous" ]] && return 0
  for ((index = 0; index < 5 && index < ${#releases[@]}; index++)); do
    [[ $candidate == "${releases[$index]}" ]] && return 0
  done
  return 1
}

removed=0
for release in "${releases[@]}"; do
  if ! is_kept "$release"; then
    rm -rf -- "$release"
    ((removed += 1))
  fi
done
printf 'Retained %d backend releases; pruned %d older releases.\n' \
  "$((${#releases[@]} - removed))" "$removed"
