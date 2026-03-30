/**
 * INTENTIONALLY VULNERABLE FILE OPERATIONS MODULE
 * ⚠️ FOR SECURITY TESTING ONLY
 */

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

// 🚨 VULNERABILITY: Path Traversal
function readUserFile(filename) {
  // No validation - allows ../../../etc/passwd
  const filePath = `/uploads/${filename}`;
  return fs.readFileSync(filePath, 'utf8');
}

// 🚨 VULNERABILITY: Directory Traversal
function getFileContents(userPath) {
  // Directly using user input
  const fullPath = path.join(__dirname, 'files', userPath);
  return fs.readFileSync(fullPath);
}

// 🚨 VULNERABILITY: Unrestricted File Upload
function saveUploadedFile(filename, content) {
  // No file type validation
  // No size limits
  // Allows .exe, .sh, .php execution
  fs.writeFileSync(`/var/www/uploads/${filename}`, content);
  return { success: true, path: `/uploads/${filename}` };
}

// 🚨 VULNERABILITY: Command Injection via Filename
function compressFile(filename) {
  // Filename not sanitized
  const command = `tar -czf ${filename}.tar.gz ${filename}`;
  exec(command, (error, stdout, stderr) => {
    if (error) console.error(error);
  });
}

// 🚨 VULNERABILITY: ZIP Slip (Archive Extraction)
function extractArchive(zipPath, extractPath) {
  // No validation of archive entries
  // Allows extraction to parent directories
  const command = `unzip ${zipPath} -d ${extractPath}`;
  exec(command);
}

// 🚨 VULNERABILITY: Arbitrary File Write
function writeLog(logFile, content) {
  // User controls file path
  fs.appendFileSync(`/logs/${logFile}`, content + '\n');
}

// 🚨 VULNERABILITY: Symlink Attack
function readConfig(configName) {
  // Follows symbolic links without checking
  const configPath = `/config/${configName}.json`;
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// 🚨 VULNERABILITY: Race Condition (TOCTOU)
function deleteFileIfExists(filepath) {
  if (fs.existsSync(filepath)) {
    // Gap between check and use
    setTimeout(() => {
      fs.unlinkSync(filepath);
    }, 1000);
  }
}

// 🚨 VULNERABILITY: Insecure Temp File
function createTempFile(data) {
  // Predictable temp file name
  const tempFile = `/tmp/upload_${Date.now()}.tmp`;
  fs.writeFileSync(tempFile, data);
  return tempFile;
}

// 🚨 VULNERABILITY: XXE (XML External Entity)
const xml2js = require('xml2js');

function parseXML(xmlString) {
  // No XXE protection
  const parser = new xml2js.Parser({
    explicitArray: false
  });
  return new Promise((resolve, reject) => {
    parser.parseString(xmlString, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

// 🚨 VULNERABILITY: Deserialization of Untrusted Data
function loadSerializedObject(serializedData) {
  // Using eval on untrusted data
  return eval('(' + serializedData + ')');
}

// 🚨 VULNERABILITY: Server-Side Template Injection
function renderTemplate(template, data) {
  // Direct string interpolation
  return eval('`' + template + '`');
}

// 🚨 VULNERABILITY: File Inclusion
function includeModule(moduleName) {
  // User-controlled module loading
  return require(moduleName);
}

// 🚨 VULNERABILITY: Denial of Service via Large Files
function processLargeFile(filepath) {
  // No size check before loading entire file into memory
  const content = fs.readFileSync(filepath);
  return content.toString().split('\n');
}

// 🚨 VULNERABILITY: Information Disclosure via File Listing
function listDirectory(dirPath) {
  // Exposes directory structure
  return fs.readdirSync(dirPath, { withFileTypes: true });
}

// 🚨 VULNERABILITY: Insecure File Permissions
function createConfigFile(filename, content) {
  // Creates file with world-readable permissions
  fs.writeFileSync(filename, content, { mode: 0o777 });
}

module.exports = {
  readUserFile,
  getFileContents,
  saveUploadedFile,
  compressFile,
  extractArchive,
  writeLog,
  readConfig,
  deleteFileIfExists,
  createTempFile,
  parseXML,
  loadSerializedObject,
  renderTemplate,
  includeModule,
  processLargeFile,
  listDirectory,
  createConfigFile
};
