#!/usr/bin/env bash
set -euo pipefail

STACK_NAME="${STACK_NAME:-compensa}"
REMOVE_VOLUMES="${REMOVE_VOLUMES:-false}"
LEAVE_SWARM="${LEAVE_SWARM:-true}"

cd "$(dirname "$0")/.."

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but was not found in PATH." >&2
  exit 1
fi

if ! docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null | grep -q '^active$'; then
  echo "Docker Swarm is not active. Nothing to remove."
  exit 0
fi

if docker stack ls --format '{{.Name}}' | grep -qx "$STACK_NAME"; then
  echo "Removing stack '$STACK_NAME'..."
  docker stack rm "$STACK_NAME"

  echo "Waiting for stack services to stop..."
  for _ in $(seq 1 60); do
    if ! docker stack services "$STACK_NAME" >/dev/null 2>&1; then
      break
    fi
    sleep 2
  done
else
  echo "Stack '$STACK_NAME' is not deployed."
fi

if [ "$REMOVE_VOLUMES" = "true" ]; then
  echo "Removing stack volumes for '$STACK_NAME'..."
  docker volume ls --format '{{.Name}}' | grep "^${STACK_NAME}_" | xargs -r docker volume rm
else
  echo "Keeping Docker volumes. Set REMOVE_VOLUMES=true to remove stack volumes."
fi

if [ "$LEAVE_SWARM" = "false" ]; then
  echo "Leaving Docker Swarm..."
  docker swarm leave --force
else
  echo "Keeping Docker Swarm active. Set LEAVE_SWARM=false to leave Swarm."
fi

echo "Destroy completed."
