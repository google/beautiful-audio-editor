// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.testing.fs.DirectoryEntryTest');
goog.setTestOnly('goog.testing.fs.DirectoryEntryTest');

goog.require('goog.array');
goog.require('goog.fs.DirectoryEntry');
goog.require('goog.fs.Error');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.fs.FileSystem');
goog.require('goog.testing.jsunit');

var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall();
var fs, dir, mockClock;

function setUp() {
  mockClock = new goog.testing.MockClock(true);

  fs = new goog.testing.fs.FileSystem();
  dir = fs.getRoot().createDirectorySync('foo');
  dir.createDirectorySync('subdir').createFileSync('subfile');
  dir.createFileSync('file');
}

function tearDown() {
  mockClock.uninstall();
}

function testIsFile() {
  assertFalse(dir.isFile());
}

function testIsDirectory() {
  assertTrue(dir.isDirectory());
}

function testRemoveWithChildren() {
  dir.getFileSync('bar', goog.fs.DirectoryEntry.Behavior.CREATE);
  expectError(dir.remove(), goog.fs.Error.ErrorCode.INVALID_MODIFICATION);
}

function testRemoveWithoutChildren() {
  var emptyDir = dir.getDirectorySync(
      'empty', goog.fs.DirectoryEntry.Behavior.CREATE);
  emptyDir.remove().
      addCallback(function() {
        assertTrue(emptyDir.deleted);
        assertFalse(fs.getRoot().hasChild('empty'));
      }).
      addBoth(continueTesting);
  waitForAsync('waiting for file removal');
}

function testRemoveRootRecursively() {
  var root = fs.getRoot();
  root.removeRecursively().addCallback(function() {
    assertTrue(dir.deleted);
    assertFalse(fs.getRoot().deleted);
  })
  .addBoth(continueTesting);
  waitForAsync('waiting for testRemoveRoot');
}

function testGetFile() {
  // Advance the clock by an arbitrary but known amount.
  mockClock.tick(41);
  dir.getFile('file').
      addCallback(function(file) {
        assertEquals(dir.getFileSync('file'), file);
        assertEquals('file', file.getName());
        assertEquals('/foo/file', file.getFullPath());
        assertTrue(file.isFile());

        return dir.getLastModified();
      }).
      addCallback(function(date) {
        assertEquals('Reading a file should not update the modification date.',
            0, date.getTime());
        return dir.getMetadata();
      }).
      addCallback(function(metadata) {
        assertEquals('Reading a file should not update the metadata.',
            0, metadata.modificationTime.getTime());
      }).
      addBoth(continueTesting);
  waitForAsync('waiting for file');
}

function testGetFileFromSubdir() {
  dir.getFile('subdir/subfile').addCallback(function(file) {
    assertEquals(dir.getDirectorySync('subdir').getFileSync('subfile'), file);
    assertEquals('subfile', file.getName());
    assertEquals('/foo/subdir/subfile', file.getFullPath());
    assertTrue(file.isFile());
  }).
      addBoth(continueTesting);
  waitForAsync('waiting for file');
}

function testGetAbsolutePaths() {
  fs.getRoot().getFile('/foo/subdir/subfile').
      addCallback(function(subfile) {
        assertEquals('/foo/subdir/subfile', subfile.getFullPath());
        return fs.getRoot().getDirectory('//foo////');
      }).
      addCallback(function(foo) {
        assertEquals('/foo', foo.getFullPath());
        return foo.getDirectory('/');
      }).
      addCallback(function(root) {
        assertEquals('/', root.getFullPath());
        return root.getDirectory('/////');
      }).
      addCallback(function(root) {
        assertEquals('/', root.getFullPath());
      }).
      addBoth(continueTesting);
  waitForAsync('testGetAbsolutePaths');
}

function testCreateFile() {
  mockClock.tick(43);
  dir.getLastModified().
      addCallback(function(date) { assertEquals(0, date.getTime()); }).
      addCallback(function() {
        return dir.getFile('bar', goog.fs.DirectoryEntry.Behavior.CREATE);
      }).
      addCallback(function(file) {
        mockClock.tick();
        assertEquals('bar', file.getName());
        assertEquals('/foo/bar', file.getFullPath());
        assertEquals(dir, file.parent);
        assertTrue(file.isFile());

        return dir.getLastModified();
      }).
      addCallback(function(date) {
        assertEquals(43, date.getTime());
        return dir.getMetadata();
      }).
      addCallback(function(metadata) {
        assertEquals(43, metadata.modificationTime.getTime());
      }).
      addBoth(continueTesting);
  waitForAsync('waiting for file creation');
}

function testCreateFileThatAlreadyExists() {
  mockClock.tick(47);
  var existingFile = dir.getFileSync('file');
  dir.getFile('file', goog.fs.DirectoryEntry.Behavior.CREATE).
      addCallback(function(file) {
        mockClock.tick();
        assertEquals('file', file.getName());
        assertEquals('/foo/file', file.getFullPath());
        assertEquals(dir, file.parent);
        assertEquals(existingFile, file);
        assertTrue(file.isFile());

        return dir.getLastModified();
      }).
      addCallback(function(date) {
        assertEquals(47, date.getTime());
        return dir.getMetadata();
      }).
      addCallback(function(metadata) {
        assertEquals(47, metadata.modificationTime.getTime());
      }).
      addBoth(continueTesting);
  waitForAsync('waiting for file creation');
}

function testCreateFileInSubdir() {
  dir.getFile('subdir/bar', goog.fs.DirectoryEntry.Behavior.CREATE).
      addCallback(function(file) {
        assertEquals('bar', file.getName());
        assertEquals('/foo/subdir/bar', file.getFullPath());
        assertEquals(dir.getDirectorySync('subdir'), file.parent);
        assertTrue(file.isFile());
      }).
      addBoth(continueTesting);
  waitForAsync('waiting for file creation');
}

function testCreateFileExclusive() {
  dir.getFile('bar', goog.fs.DirectoryEntry.Behavior.CREATE_EXCLUSIVE).
      addCallback(function(file) {
        assertEquals('bar', file.getName());
        assertEquals('/foo/bar', file.getFullPath());
        assertEquals(dir, file.parent);
        assertTrue(file.isFile());
      }).
      addBoth(continueTesting);
  waitForAsync('waiting for file creation');
}

function testGetNonExistentFile() {
  expectError(dir.getFile('bar'), goog.fs.Error.ErrorCode.NOT_FOUND);
}

function testGetNonExistentFileInSubdir() {
  expectError(dir.getFile('subdir/bar'), goog.fs.Error.ErrorCode.NOT_FOUND);
}

function testGetFileInNonExistentSubdir() {
  expectError(dir.getFile('bar/subfile'), goog.fs.Error.ErrorCode.NOT_FOUND);
}

function testGetFileThatsActuallyADirectory() {
  expectError(dir.getFile('subdir'), goog.fs.Error.ErrorCode.TYPE_MISMATCH);
}

function testCreateFileInNonExistentSubdir() {
  expectError(
      dir.getFile('bar/newfile', goog.fs.DirectoryEntry.Behavior.CREATE),
      goog.fs.Error.ErrorCode.NOT_FOUND);
}

function testCreateFileThatsActuallyADirectory() {
  expectError(
      dir.getFile('subdir', goog.fs.DirectoryEntry.Behavior.CREATE),
      goog.fs.Error.ErrorCode.TYPE_MISMATCH);
}

function testCreateExclusiveExistingFile() {
  expectError(
      dir.getFile('file', goog.fs.DirectoryEntry.Behavior.CREATE_EXCLUSIVE),
      goog.fs.Error.ErrorCode.INVALID_MODIFICATION);
}

function testListEmptyDirectory() {
  var emptyDir = fs.getRoot().
      getDirectorySync('empty', goog.fs.DirectoryEntry.Behavior.CREATE);

  emptyDir.listDirectory().
      addCallback(function(entryList) {
        assertSameElements([], entryList);
      }).
      addBoth(continueTesting);
  waitForAsync('testListEmptyDirectory');
}

function testListDirectory() {
  var root = fs.getRoot();
  root.getDirectorySync('dir1', goog.fs.DirectoryEntry.Behavior.CREATE);
  root.getDirectorySync('dir2', goog.fs.DirectoryEntry.Behavior.CREATE);
  root.getFileSync('file1', goog.fs.DirectoryEntry.Behavior.CREATE);
  root.getFileSync('file2', goog.fs.DirectoryEntry.Behavior.CREATE);

  fs.getRoot().listDirectory().
      addCallback(function(entryList) {
        assertSameElements([
          'dir1',
          'dir2',
          'file1',
          'file2',
          'foo'
        ],
        goog.array.map(entryList, function(entry) {
          return entry.getName();
        }));
      }).
      addBoth(continueTesting);
  waitForAsync('testListDirectory');
}

function testCreatePath() {
  dir.createPath('baz/bat').
      addCallback(function(batDir) {
        assertEquals('/foo/baz/bat', batDir.getFullPath());
        return batDir.createPath('../zazzle');
      }).
      addCallback(function(zazzleDir) {
        assertEquals('/foo/baz/zazzle', zazzleDir.getFullPath());
        return zazzleDir.createPath('/elements/actinides/neptunium/');
      }).
      addCallback(function(elDir) {
        assertEquals('/elements/actinides/neptunium', elDir.getFullPath());
      }).
      addBoth(continueTesting);
  waitForAsync('testCreatePath');
}


function continueTesting(result) {
  asyncTestCase.continueTesting();
  if (result instanceof Error) {
    throw result;
  }
  mockClock.tick();
}

function expectError(deferred, code) {
  deferred.
      addCallback(function() { fail('Expected an error'); }).
      addErrback(function(err) {
        assertEquals(code, err.code);
        asyncTestCase.continueTesting();
      });
  waitForAsync('waiting for error');
}

function waitForAsync(msg) {
  asyncTestCase.waitForAsync(msg);
  mockClock.tick();
}
