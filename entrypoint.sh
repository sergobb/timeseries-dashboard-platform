#!/bin/sh
set -e

attempt=1
max_attempts=10

while [ "$attempt" -le "$max_attempts" ]; do
  if node scripts/create-user-admin.cjs; then
    break
  fi

  if [ "$attempt" -eq "$max_attempts" ]; then
    echo "create-user-admin failed after ${max_attempts} attempts" >&2
    exit 1
  fi

  echo "create-user-admin failed, retrying in 2s... (${attempt}/${max_attempts})" >&2
  attempt=$((attempt + 1))
  sleep 2
done

exec "$@"
