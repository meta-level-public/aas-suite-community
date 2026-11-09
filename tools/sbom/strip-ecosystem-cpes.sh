#!/usr/bin/env bash
# Removes the CPEs that syft guesses for packages which have an ecosystem purl (npm, NuGet, Go, PyPI, Maven, ...).
#
# Why: syft derives a CPE from the package name, e.g. cpe:2.3:a:sirv:sirv:3.0.2:*:*:*:*:*:*:* for the npm package
# "sirv". Scanners that match CPEs against the NVD then report CVEs of unrelated products with the same name
# (here the WordPress plugin "Sirv"). For these ecosystems the purl is unambiguous and the advisory databases
# (GitHub Advisory Database, OSV) are keyed by it, so the CPE only adds false positives.
# OS packages (deb, apk, rpm) and binaries without an ecosystem purl keep their CPE, because some advisories for
# them are only available via CPE.
#
# Usage: strip-ecosystem-cpes.sh <cyclonedx.json> [more files ...]   (files are rewritten in place)
set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "usage: $0 <cyclonedx.json> [...]" >&2
  exit 2
fi

for file in "$@"; do
  tmp="$(mktemp)"
  jq '
    def ecosystem_purl:
      (.purl // "") | test("^pkg:(npm|nuget|golang|pypi|maven|cargo|gem|composer|hex|pub|swift|cocoapods)/");
    walk(
      if type == "object" and has("purl") and ecosystem_purl then
        del(.cpe)
        | if has("properties") then .properties |= map(select((.name // "") | test("cpe"; "i") | not)) else . end
      else . end
    )
  ' "$file" > "$tmp"
  mv "$tmp" "$file"
  before_after="$(jq '[.. | objects | select(has("cpe"))] | length' "$file")"
  echo "$file: $before_after components still carry a CPE (OS packages and binaries)"
done
