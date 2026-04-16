#!/bin/bash
# Auto-increment version in manifest.json before each push

MANIFEST="manifest.json"
BACKUP="${MANIFEST}.bak"

# Read current version
VERSION=$(grep -o '"version": "[^"]*"' "$MANIFEST" | sed 's/"version": "//;s/"//')

# Split into major.minor.patch
IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"

# Increment patch version
PATCH=$((PATCH + 1))

# Reconstruct new version
NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"

# Replace version in manifest
sed -i "s/\"version\": \"$VERSION\"/\"version\": \"$NEW_VERSION\"/" "$MANIFEST"

# Auto-commit the version bump
git add "$MANIFEST"
git commit -m "chore: bump version to $NEW_VERSION"

echo "Version bumped: $VERSION -> $NEW_VERSION"
