"""Read-only comparison with a separately reviewed, pinned artifact manifest.

Checks file membership and bytes, not content safety or release authorization.
Run against a quiescent local directory; this is not an atomic publication gate.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import stat


def no_duplicate_keys(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("DUPLICATE_JSON_KEY")
        result[key] = value
    return result


def valid_relative_path(value):
    if not isinstance(value, str) or not value:
        return False
    if any(ord(char) < 32 for char in value) or re.search(r'[\\:*?"<>|]', value):
        return False
    parts = value.split('/')
    return all(part and part not in {'.', '..'} and not part.endswith((' ', '.'))
               and not re.fullmatch(r'(?i)(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?', part)
               for part in parts)


def is_link(path):
    return path.is_symlink() or path.is_junction()


def check_artifact(directory, manifest_path, manifest_sha256):
    result = {"pass": False, "checked_files": 0, "errors": [],
              "content_safety_verified": False, "release_authorized": False}
    root = Path(directory)
    manifest = Path(manifest_path)
    try:
        if is_link(root) or not root.is_dir():
            raise ValueError("ARTIFACT_ROOT_NOT_PLAIN_DIRECTORY")
        root = root.resolve(strict=True)
        if is_link(manifest) or manifest.resolve(strict=True).is_relative_to(root):
            raise ValueError("MANIFEST_MUST_BE_SEPARATE_REGULAR_FILE")
        if not manifest.is_file():
            raise ValueError("MANIFEST_MUST_BE_SEPARATE_REGULAR_FILE")
        raw = manifest.read_bytes()
        if not re.fullmatch(r'[0-9a-f]{64}', manifest_sha256):
            raise ValueError("INVALID_MANIFEST_PIN")
        if hashlib.sha256(raw).hexdigest() != manifest_sha256:
            raise ValueError("MANIFEST_HASH_MISMATCH")
        data = json.loads(raw, object_pairs_hook=no_duplicate_keys)
        if not isinstance(data, dict) or set(data) != {'version', 'files'} or type(data['version']) is not int or data['version'] != 1:
            raise ValueError("INVALID_MANIFEST")
        if not isinstance(data['files'], list) or not data['files']:
            raise ValueError("EMPTY_OR_INVALID_MANIFEST")
        expected = {}
        folded = set()
        for entry in data['files']:
            if not isinstance(entry, dict) or set(entry) != {'path', 'sha256', 'size'}:
                raise ValueError("INVALID_FILE_ENTRY")
            name = entry['path']
            if not valid_relative_path(name):
                raise ValueError("INVALID_MANIFEST_PATH")
            if name.casefold() in folded:
                raise ValueError("DUPLICATE_MANIFEST_PATH")
            if not isinstance(entry['sha256'], str) or not re.fullmatch(r'[0-9a-f]{64}', entry['sha256']):
                raise ValueError("INVALID_FILE_HASH")
            if type(entry['size']) is not int or entry['size'] < 0:
                raise ValueError("INVALID_FILE_SIZE")
            expected[name] = entry
            folded.add(name.casefold())
        directories = {parent.as_posix() for name in expected for parent in Path(name).parents if parent.as_posix() != '.'}
        seen = set()
        pending = [root]
        while pending:
            folder = pending.pop()
            for path in sorted(folder.iterdir()):
                name = path.relative_to(root).as_posix()
                if is_link(path):
                    result['errors'].append({"code": "LINK_NOT_ALLOWED", "path": name})
                    continue
                mode = path.stat(follow_symlinks=False).st_mode
                if stat.S_ISDIR(mode):
                    if name not in directories:
                        result['errors'].append({"code": "UNEXPECTED_DIRECTORY", "path": name})
                        continue
                    pending.append(path)
                    continue
                if not stat.S_ISREG(mode):
                    result['errors'].append({"code": "SPECIAL_FILE_NOT_ALLOWED", "path": name})
                    continue
                if name not in expected:
                    result['errors'].append({"code": "UNEXPECTED_FILE", "path": name})
                    continue
                seen.add(name)
                with path.open('rb') as stream:
                    actual = hashlib.file_digest(stream, 'sha256').hexdigest()
                result['checked_files'] += 1
                if actual != expected[name]['sha256'] or path.stat().st_size != expected[name]['size']:
                    result['errors'].append({"code": "FILE_CONTENT_MISMATCH", "path": name})
        result['errors'].extend({"code": "MISSING_FILE", "path": name} for name in sorted(set(expected) - seen))
        result['pass'] = not result['errors']
    except (OSError, ValueError, UnicodeError) as error:
        # Do not include file contents or sensitive values in diagnostics.
        code = str(error) if type(error) is ValueError and str(error).isupper() else type(error).__name__
        result['errors'].append({"code": code})
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--artifact', required=True)
    parser.add_argument('--manifest', required=True)
    parser.add_argument('--manifest-sha256', required=True)
    args = parser.parse_args()
    result = check_artifact(args.artifact, args.manifest, args.manifest_sha256)
    print(json.dumps(result, ensure_ascii=True))
    return 0 if result['pass'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
