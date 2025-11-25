#!/usr/bin/env bash

set -euo pipefail

# Determine repository root (folder containing this script/..).
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)

OUTPUT_ZIP="${REPO_ROOT}/dist/epl-sources.zip"
LICENSE_FILE="${REPO_ROOT}/license-comply/EPL-2.0.txt"
NOTICE_FILE=""

to_absolute_path() {
	if [[ "$1" = /* ]]; then
		printf '%s\n' "$1"
	else
		printf '%s\n' "${REPO_ROOT}/$1"
	fi
}

usage() {
	cat <<-'EOF'
	Usage: package-epl-sources.sh [--output <zip-path>] [--license <path>] [--notice <path>]

	  --output   Path for the generated zip (default: dist/epl-sources.zip)
	  --license  Path to the EPL license text (default: LICENSE-EPL-2.0.txt in repo root)
	  --notice   Optional notice file to include alongside the license text
	EOF
}

while [[ $# -gt 0 ]]; do
	case "$1" in
		--output)
			[[ $# -ge 2 ]] || { echo "Missing value for --output" >&2; usage; exit 1; }
			OUTPUT_ZIP=$(to_absolute_path "$2")
			shift 2
			;;
		--license)
			[[ $# -ge 2 ]] || { echo "Missing value for --license" >&2; usage; exit 1; }
			LICENSE_FILE=$(to_absolute_path "$2")
			shift 2
			;;
		--notice)
			[[ $# -ge 2 ]] || { echo "Missing value for --notice" >&2; usage; exit 1; }
			NOTICE_FILE=$(to_absolute_path "$2")
			shift 2
			;;
		-h|--help)
			usage
			exit 0
			;;
		*)
			echo "Unknown argument: $1" >&2
			usage
			exit 1
			;;
	esac
done

if [[ ! -f "${LICENSE_FILE}" ]]; then
	echo "EPL license text not found at ${LICENSE_FILE} (override with --license)." >&2
	exit 1
fi

if [[ -n "${NOTICE_FILE}" && ! -f "${NOTICE_FILE}" ]]; then
	echo "NOTICE file not found at ${NOTICE_FILE}." >&2
	exit 1
fi

if ! command -v zip >/dev/null 2>&1; then
	echo "'zip' command not found. Please install it and retry." >&2
	exit 1
fi

EPL_FILES=()
while IFS= read -r line; do
	EPL_FILES+=("$line")
done < <(
	cd "${REPO_ROOT}" && \
	rg --files-with-matches \
		--iglob '!.git/**' \
		--iglob '!node_modules/**' \
		--iglob '!dist/**' \
		--iglob '!**/*.map' \
		--regexp 'Eclipse Public License|SPDX-License-Identifier: EPL-2.0' \
		.
)

if [[ ${#EPL_FILES[@]} -eq 0 ]]; then
	echo "No EPL notice files found. Nothing to package." >&2
	exit 1
fi

STAGING_DIR=$(mktemp -d)
trap 'rm -rf "${STAGING_DIR}"' EXIT

RELATIVE_FILES=()

for file in "${EPL_FILES[@]}"; do
	RELATIVE_PATH=${file#./}
	DEST_PATH="${STAGING_DIR}/${RELATIVE_PATH}"
	mkdir -p "$(dirname "${DEST_PATH}")"
	cp "${REPO_ROOT}/${RELATIVE_PATH}" "${DEST_PATH}"
	RELATIVE_FILES+=("${RELATIVE_PATH}")
done

printf '%s\n' "${RELATIVE_FILES[@]}" | sort > "${STAGING_DIR}/EPL_FILES.txt"

mkdir -p "${STAGING_DIR}/LICENSES"
cp "${LICENSE_FILE}" "${STAGING_DIR}/LICENSES/"

if [[ -n "${NOTICE_FILE}" ]]; then
	cp "${NOTICE_FILE}" "${STAGING_DIR}/LICENSES/"
fi

mkdir -p "$(dirname "${OUTPUT_ZIP}")"
(
	cd "${STAGING_DIR}"
	zip -qr "${OUTPUT_ZIP}" .
)

echo "Packaged ${#RELATIVE_FILES[@]} EPL-covered files into ${OUTPUT_ZIP}"
