const { sumiVersion: _sumiVersion, version: _productVersion } = require('../product.json');

const sumiVersion = process.env.SUMI_VERSION || _sumiVersion;
const productVersion = process.env.PRODUCT_VERSION || _productVersion;

const { writeFileSync } = require('fs');
const path = require('path');

function saveWithPrettier(jsonPath, jsonContent) {
  try {
    const prettier = require('prettier');
    const fileInfo = prettier.getFileInfo.sync(jsonPath, {
      resolveConfig: true,
    });
    prettier.resolveConfigFile().then((v) => {
      prettier.resolveConfig(v).then((options) => {
        const content = prettier.format(JSON.stringify(jsonContent), {
          parser: fileInfo.inferredParser,
          ...options,
        });
        writeFileSync(jsonPath, content);
      });
    });
  } catch (error) {
    console.log('prettier is not installed');
    writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2));
  }
}

function applySumiVersion() {
  const package = require('../package.json');
  const devDependencies = package['devDependencies'];
  const jsonPath = path.join(__dirname, '../package.json');

  for (const [k] of Object.entries(devDependencies)) {
    if (k === '@opensumi/di') {
      continue;
    }

    if (!k.startsWith('@opensumi/')) {
      continue;
    }
    devDependencies[k] = sumiVersion;
  }

  saveWithPrettier(jsonPath, package);
}

function applyVersion() {
  const buildPackage = require('../build/package.json');
  buildPackage['version'] = productVersion;
  const jsonPath = path.join(__dirname, '../build/package.json');
  saveWithPrettier(jsonPath, buildPackage);
}

applySumiVersion();
applyVersion();
