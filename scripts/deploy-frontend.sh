#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
[[ $(node -p 'process.versions.node.split(".")[0]') == 22 ]]
[[ -z $(git status --porcelain) ]] || { echo 'Working tree must be clean' >&2; exit 1; }
commit=$(git rev-parse HEAD)
branch=$(git branch --show-current)
[[ $commit == $(git ls-remote origin "refs/heads/$branch" | cut -f1) ]] || { echo 'Push this verified commit before deployment' >&2; exit 1; }
npm run frontend:typecheck
npm run frontend:build
node scripts/scan-secrets.mjs dist/frontend
node --input-type=module - "$commit" <<'JS'
import {writeFileSync,readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const files={};
function walk(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const path=`${dir}/${entry.name}`;if(entry.isDirectory())walk(path);else files[path.slice('dist/frontend/'.length)]=createHash('sha256').update(readFileSync(path)).digest('hex');}}
walk('dist/frontend');
writeFileSync('dist/frontend/frontend-release.json',JSON.stringify({commit:process.argv[2],files},null,2)+'\n');
JS
archive="/tmp/nbd-frontend-$commit.tar.gz"
COPYFILE_DISABLE=1 tar --no-xattrs -czf "$archive" -C dist/frontend .
hash=$(shasum -a 256 "$archive" | cut -d ' ' -f1)
key=/Users/leo/Desktop/ssh-key-removing-restricted/leo-web-key.pem
ssh_opts=(-o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=12 -i "$key")
scp "${ssh_opts[@]}" "$archive" leo@20.48.14.96:"$archive"
ssh "${ssh_opts[@]}" leo@20.48.14.96 "sudo -n bash -s -- '$archive' '$commit' '$hash'" < deploy/install-frontend.sh
curl -fsS https://nbd.dkz12345.com/frontend-release.json
