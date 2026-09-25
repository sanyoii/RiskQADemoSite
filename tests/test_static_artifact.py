import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from check_static_artifact import check_artifact


class StaticArtifactTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.artifact = self.root / 'artifact'
        self.artifact.mkdir()
        self.payload = b'<!doctype html><title>Public fixture</title>'
        (self.artifact / 'index.html').write_bytes(self.payload)
        self.manifest = self.root / 'reviewed.json'
        self.data = {'version': 1, 'files': [{'path': 'index.html', 'size': len(self.payload), 'sha256': hashlib.sha256(self.payload).hexdigest()}]}
        self.pin = self.save_manifest()

    def save_manifest(self):
        raw = json.dumps(self.data).encode()
        self.manifest.write_bytes(raw)
        return hashlib.sha256(raw).hexdigest()

    def check(self):
        return check_artifact(self.artifact, self.manifest, self.pin)

    def assert_rejected(self, code):
        result = self.check()
        self.assertFalse(result['pass'])
        self.assertIn(code, [error['code'] for error in result['errors']])

    def test_exact_artifact_passes_without_release_authority(self):
        result = self.check()
        self.assertTrue(result['pass'])
        self.assertEqual(result['checked_files'], 1)
        self.assertFalse(result['release_authorized'])
        self.assertFalse(result['content_safety_verified'])

    def test_extra_hidden_file_is_rejected_without_disclosing_content(self):
        (self.artifact / '.env').write_text('SYNTHETIC_PRIVATE_VALUE')
        self.assert_rejected('UNEXPECTED_FILE')
        self.assertNotIn('SYNTHETIC_PRIVATE_VALUE', json.dumps(self.check()))

    def test_extra_directory_is_rejected(self):
        (self.artifact / 'unexpected').mkdir()
        self.assert_rejected('UNEXPECTED_DIRECTORY')

    def test_missing_file_is_rejected(self):
        # Move only the disposable test fixture; preserve its bytes outside artifact.
        (self.artifact / 'index.html').rename(self.root / 'withheld.html')
        self.assert_rejected('MISSING_FILE')

    def test_same_size_content_change_is_rejected(self):
        (self.artifact / 'index.html').write_bytes(b'X' * len(self.payload))
        self.assert_rejected('FILE_CONTENT_MISMATCH')

    def test_changed_manifest_cannot_bless_changed_artifact(self):
        (self.artifact / 'index.html').write_bytes(b'changed')
        self.data['files'][0].update(size=7, sha256=hashlib.sha256(b'changed').hexdigest())
        self.save_manifest()
        self.assert_rejected('MANIFEST_HASH_MISMATCH')

    def test_invalid_manifest_paths_are_rejected(self):
        for path in ['../index.html', '/index.html', 'C:/index.html', 'a\\index.html', 'a//index.html', './index.html', 'a/../index.html', 'CON.txt', 'x./index.html']:
            with self.subTest(path=path):
                self.data['files'][0]['path'] = path
                self.pin = self.save_manifest()
                self.assert_rejected('INVALID_MANIFEST_PATH')

    def test_case_colliding_manifest_paths_are_rejected(self):
        self.data['files'].append(dict(self.data['files'][0], path='INDEX.html'))
        self.pin = self.save_manifest()
        self.assert_rejected('DUPLICATE_MANIFEST_PATH')

    def test_empty_manifest_cannot_approve_empty_artifact(self):
        self.data['files'] = []
        self.pin = self.save_manifest()
        self.assert_rejected('EMPTY_OR_INVALID_MANIFEST')

    def test_duplicate_json_keys_are_rejected(self):
        raw = b'{"version":1,"version":1,"files":[]}'
        self.manifest.write_bytes(raw)
        self.pin = hashlib.sha256(raw).hexdigest()
        self.assert_rejected('DUPLICATE_JSON_KEY')

    def test_manifest_inside_artifact_is_rejected(self):
        self.manifest = self.artifact / 'reviewed.json'
        self.pin = self.save_manifest()
        self.assert_rejected('MANIFEST_MUST_BE_SEPARATE_REGULAR_FILE')

    def test_link_to_outside_file_is_rejected(self):
        try:
            (self.artifact / 'linked.html').symlink_to(self.manifest)
        except OSError as error:
            self.skipTest('Host does not permit symlink creation: ' + type(error).__name__)
        self.assert_rejected('LINK_NOT_ALLOWED')

    def test_cli_failure_exit_is_nonzero(self):
        (self.artifact / 'unreviewed.txt').write_text('synthetic')
        result = subprocess.run([sys.executable, str(Path(__file__).resolve().parents[1] / 'scripts/check_static_artifact.py'), '--artifact', str(self.artifact), '--manifest', str(self.manifest), '--manifest-sha256', self.pin], capture_output=True, text=True)
        self.assertEqual(result.returncode, 1)
        self.assertFalse(json.loads(result.stdout)['pass'])


if __name__ == '__main__':
    unittest.main()
