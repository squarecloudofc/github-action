import assert from "node:assert/strict";
import { test } from "node:test";

import { assetName, checkVersion, checksumOf } from "./context.ts";

test("every runner maps to a CLI release archive", () => {
  assert.equal(assetName("linux", "x64"), "squarecloud_linux_amd64.tar.gz");
  assert.equal(assetName("linux", "arm64"), "squarecloud_linux_arm64.tar.gz");
  assert.equal(assetName("linux", "arm"), "squarecloud_linux_armv7.tar.gz");
  assert.equal(assetName("linux", "ia32"), "squarecloud_linux_386.tar.gz");
  assert.equal(assetName("darwin", "arm64"), "squarecloud_darwin_arm64.tar.gz");
  assert.equal(assetName("darwin", "x64"), "squarecloud_darwin_amd64.tar.gz");
  assert.equal(assetName("win32", "x64"), "squarecloud_windows_amd64.zip");
  assert.equal(assetName("win32", "arm64"), "squarecloud_windows_arm64.zip");
  assert.throws(() => assetName("freebsd", "x64"), /no build for freebsd/);
  assert.throws(() => assetName("linux", "riscv64"), /no build for linux on riscv64/);
});

test("a pinned version must read SQUARECLOUD_API_KEY", () => {
  for (const ok of ["3.1.0", "3.1.2", "3.10.0", "4.0.0"]) assert.equal(checkVersion(ok), ok);
  for (const old of ["3.0.1", "2.5.9", "1.0.0"]) assert.throws(() => checkVersion(old), /3\.1\.0 or later/);
});

test("the checksum is read for the exact archive name", () => {
  const checksums = [
    "aaa  squarecloud_linux_amd64.tar.gz",
    "bbb  squarecloud_linux_arm64.tar.gz",
    "",
  ].join("\n");
  assert.equal(checksumOf(checksums, "squarecloud_linux_arm64.tar.gz"), "bbb");
  assert.equal(checksumOf(checksums, "squarecloud_linux_amd64.tar"), undefined);
});
