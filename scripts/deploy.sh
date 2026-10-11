#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
[[ $(node -p 'process.versions.node.split(".")[0]') == 22 ]]
npm run check
[[ -z $(git status --porcelain) ]] || { echo 'Working tree must be clean' >&2; exit 1; }
commit=$(git rev-parse HEAD)
branch=$(git branch --show-current)
remote_commit=$(git ls-remote origin "refs/heads/$branch" | cut -f1)
[[ $commit == "$remote_commit" ]] || { echo 'Push this exact verified commit before deployment' >&2; exit 1; }
npm run build
staging=$(mktemp -d /tmp/nbd-package.XXXXXX)
archive="/tmp/nbd-$commit.tar.gz"
trap 'rm -rf "$staging"' EXIT
git archive HEAD | tar -x -C "$staging"
cp -R dist "$staging/dist"
node scripts/scan-secrets.mjs "$staging"
node --input-type=module - "$staging" "$commit" <<'JS'
import {writeFileSync} from 'node:fs';import {join} from 'node:path';
writeFileSync(join(process.argv[2],'RELEASE.json'),JSON.stringify({commit:process.argv[3],repository:'https://github.com/Leo-learner/nbd',createdAt:new Date().toISOString()},null,2)+'\n');
JS
tar -czf "$archive" -C "$staging" .
hash=$(shasum -a 256 "$archive" | cut -d ' ' -f1)
key=/Users/leo/Desktop/ssh-key-removing-restricted/leo-web-key.pem
ssh_opts=(-o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=12 -i "$key")
scp "${ssh_opts[@]}" "$archive" leo@20.48.14.96:"$archive"
ssh "${ssh_opts[@]}" leo@20.48.14.96 "sudo -n bash -s -- '$archive' '$commit' '$hash'" < deploy/install.sh
curl -fsS https://nbd.dkz12345.com/readyz
