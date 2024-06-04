import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

function getObjectProperty(obj, property) {
  return property.split('.').reduce((acc, key) => acc && acc[key], obj);
}

function extractNestedKeys(data, mapping) {
  const result = {
    original: {},
    translation: {},
  };

  for (const [k, v] of Object.entries(mapping)) {
    const value = getObjectProperty(data, k);

    if (value) {
      result['original'][`original_${v}`] = value;
      result['translation'][v] = value;
    }
  }

  return Object.assign({}, result.original, result.translation);
}

function prepareData(path) {
  try {
    fs.accessSync(path);

    return yaml.parse(fs.readFileSync(path, 'utf8'));
  } catch (err) {
    return {};
  }
}

function extractKeys(inputDir, outputDir, mapping) {
  for (const rootDir of fs.readdirSync(inputDir, { withFileTypes: true })) {
    const root = path.join(inputDir, rootDir.name);

    if (!rootDir.isDirectory()) {
      continue;
    }

    for (const file of fs.readdirSync(root)) {
      if (!file.endsWith('.yml')) {
        continue;
      }

      const inputPath = path.join(root, file);
      const outputPath = path.join(outputDir, path.relative(inputDir, root), file);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });

      const data = yaml.parse(fs.readFileSync(inputPath, 'utf8'));
      const extractedData = extractNestedKeys(data, mapping);

      fs.writeFileSync(
        outputPath,
        yaml.stringify(Object.assign({}, extractedData, prepareData(outputPath))),
      );
    }
  }
}

const inputDirectory = '_packs/extractions';
const outputDirectory = '_packs/translations';

const keyMapping = {
  'name': 'name',
  'system.description': 'description',
  'system.moveResults.success.value': 'success',
  'system.moveResults.partial.value': 'partial',
  'system.moveResults.failure.value': 'failure',
  'system.choices': 'choices',
  'system.tags': 'tags',
};

extractKeys(inputDirectory, outputDirectory, keyMapping);
