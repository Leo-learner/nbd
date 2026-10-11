#!/usr/bin/env bash
set -euo pipefail
if [[ " ${RENEWED_DOMAINS:-} " == *" nbd.dkz12345.com "* ]]; then
  nginx -t
  systemctl reload nginx
fi
