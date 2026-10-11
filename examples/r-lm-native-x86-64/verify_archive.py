#!/usr/bin/env python3
"""Verify the preserved R lm native-QR reference artifact without rebuilding it.

This verifies bytes and archive structure, not lm() interpreter integration,
numerical completeness, or independent AICI acceptance.
"""
from __future__ import annotations

import argparse
import hashlib
import shutil
import tempfile
import zipfile
from pathlib import Path

ARCHIVE = "english-major-c-lm-x86-64-native-disassembly.zip"
INNER_DIRECTORY = "english-major-c-lm-assembly/"
SHA256 = {
    ARCHIVE: "f0954f5c54dee2df9ff93a65f525339b8e555389f004c2b978e1ace0b71f19ac",
    "dqrls.x86-64.disasm.txt": "968488c7e15ab89373587fa66e65fffc62cdc92bccca2e9d63c40728d69910f2",
    "dqrdc2.x86-64.disasm.txt": "1d39427ac5b32ddab7a22a303150cb9c8e29b2fa03df49f81ba88d39be58e0c4",
    "dqrsl.x86-64.disasm.txt": "ce2660259bd9dd68a76f1e00b9082c6a92d2d04071686ff97543e0386fed25fe",
}
ARCHIVED_FILES = {
    "call_r_qr",
    "call_r_qr.c",
    "dqrls.f",
    "dqrdc2.f",
    "dqrsl.f",
    "dqrls.o",
    "dqrdc2.o",
    "dqrsl.o",
    "dqrls.x86-64.disasm.txt",
    "dqrdc2.x86-64.disasm.txt",
    "dqrsl.x86-64.disasm.txt",
    "linked-executable.x86-64.disasm.txt",
    "README.txt",
    "sha256sums.txt",
    "test-output.txt",
    "model_example.R",
}
LEDGER_FILES = {
    "dqrls.o", "dqrdc2.o", "dqrsl.o", "call_r_qr",
    "dqrls.x86-64.disasm.txt", "dqrdc2.x86-64.disasm.txt",
    "dqrsl.x86-64.disasm.txt", "linked-executable.x86-64.disasm.txt",
}


class ArtifactMismatch(Exception):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ArtifactMismatch(message)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def verify(directory: Path) -> None:
    # Verify raw file identities before opening any archived executable content.
    raw = {}
    for name, expected_hash in SHA256.items():
        path = directory / name
        require(path.is_file(), f"missing file: {name}")
        data = path.read_bytes()
        require(sha256(data) == expected_hash, f"SHA-256 mismatch: {name}")
        raw[name] = data

    with zipfile.ZipFile(directory / ARCHIVE) as archive:
        infos = archive.infolist()
        names = [entry.filename for entry in infos]
        require(len(names) == len(set(names)), "duplicate ZIP member names")
        expected_names = {INNER_DIRECTORY} | {
            INNER_DIRECTORY + name for name in ARCHIVED_FILES
        }
        require(set(names) == expected_names, "unexpected or missing ZIP members")
        require(sum(entry.file_size for entry in infos) <= 300_000,
                "unexpected expanded ZIP size")
        require(archive.testzip() is None, "ZIP member CRC mismatch")

        ledger_bytes = archive.read(INNER_DIRECTORY + "sha256sums.txt")
        try:
            lines = ledger_bytes.decode("ascii").splitlines()
        except UnicodeDecodeError as exc:
            raise ArtifactMismatch("checksum ledger is not ASCII") from exc
        parsed = {}
        for line in lines:
            parts = line.split("  ", 1)
            require(len(parts) == 2, "malformed checksum ledger line")
            digest, name = parts
            require(
                len(digest) == 64
                and all(char in "0123456789abcdef" for char in digest),
                "invalid SHA-256 in checksum ledger",
            )
            require(name not in parsed, "duplicate checksum ledger entry")
            parsed[name] = digest
        require(set(parsed) == LEDGER_FILES, "unexpected checksum ledger entries")
        for name, expected_hash in parsed.items():
            data = archive.read(INNER_DIRECTORY + name)
            require(sha256(data) == expected_hash,
                    f"internal ZIP checksum mismatch: {name}")

        for name in SHA256:
            if name != ARCHIVE:
                require(
                    archive.read(INNER_DIRECTORY + name) == raw[name],
                    f"outside disassembly differs from ZIP: {name}",
                )


def test_rejection_of_mutations(directory: Path) -> None:
    with tempfile.TemporaryDirectory(prefix="lm-artifact-verify-") as tmp:
        copy = Path(tmp)
        for name in SHA256:
            shutil.copyfile(directory / name, copy / name)

        routine = copy / "dqrls.x86-64.disasm.txt"
        original = routine.read_bytes()
        routine.write_bytes(original[:-1] + bytes([original[-1] ^ 1]))
        try:
            verify(copy)
        except ArtifactMismatch:
            pass
        else:
            raise ArtifactMismatch("tampered disassembly was accepted")
        routine.write_bytes(original)

        archive = copy / ARCHIVE
        original = archive.read_bytes()
        archive.write_bytes(original[:-1] + bytes([original[-1] ^ 1]))
        try:
            verify(copy)
        except ArtifactMismatch:
            pass
        else:
            raise ArtifactMismatch("tampered ZIP was accepted")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--self-test", action="store_true",
                        help="prove two byte mutations fail closed")
    args = parser.parse_args()
    try:
        root = Path(__file__).resolve().parent
        verify(root)
        if args.self_test:
            test_rejection_of_mutations(root)
    except (ArtifactMismatch, OSError, zipfile.BadZipFile) as exc:
        parser.exit(1, f"FAIL: {exc}\n")
    print("PASS: exact archived R lm QR reference bytes, ZIP checksums, and listing copies")
    if args.self_test:
        print("PASS: modified disassembly and modified ZIP both rejected")
