import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

function generateJson(inputDir, outputDir, compendiumLabels) {
  fs.mkdirSync(outputDir, { recursive: true });

  const keysToGrab = ['name', 'description', 'success', 'partial', 'failure', 'choices', 'tags'];

  for (const rootDir of fs.readdirSync(inputDir, { withFileTypes: true })) {
    const directoryPath = path.join(inputDir, rootDir.name);

    if (!rootDir.isDirectory()) {
      continue;
    }

    const jsonData = {
      'label': compendiumLabels[rootDir.name] || rootDir.name,
      'mapping': {
        'description': 'system.description',
        'success': 'system.moveResults.success.value',
        'partial': 'system.moveResults.partial.value',
        'failure': 'system.moveResults.failure.value',
        'choices': 'system.choices',
        'tags': 'system.tags',
        'successLabel': {
          'path': 'system.moveResults.success.label',
          'converter': 'resultLabel',
        },
        'partialLabel': {
          'path': 'system.moveResults.partial.label',
          'converter': 'resultLabel',
        },
        'failureLabel': {
          'path': 'system.moveResults.failure.label',
          'converter': 'resultLabel',
        },
      },
      'entries': {},
    };

    for (const file of fs.readdirSync(directoryPath)) {
      if (!file.endsWith('.yml')) {
        continue;
      }

      const inputPath = path.join(directoryPath, file);
      const data = yaml.parse(fs.readFileSync(inputPath, 'utf8'));
      const entryName = data['original_name'];

      if (!entryName) {
        continue;
      }

      const entryData = {};

      for (const key of keysToGrab) {
        if (data[key]) {
          entryData[key] = data[key];
        }
      }

      jsonData['entries'][entryName] = entryData;
    }

    const jsonFilename = `motw-for-pbta.${rootDir.name}.json`;
    const outputPath = path.join(outputDir, jsonFilename);
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
  }
}

const inputDirectory = '_packs/translations';
const outputDir = 'compendium/fr';
const compendiumLabels = {
  'basic-moves': 'Manœuvres basiques',
  'other-moves': 'Autres manœuvres',
  'playbooks': 'Livrets - Module de base',
  'special-moves-tom': 'Manœuvres spéciales [ToM]',
  'tags': 'Traits',
  'the-chosen': 'L’Élu',
  'the-crooked': 'Le Vaurien',
  'the-divine': 'Le Divin',
  'the-expert': 'L’Expert',
  'the-flake': 'Le Parano',
  'the-gumshoe-tom': 'the-gumshoe-tom',
  'the-hex-tom': 'the-hex-tom',
  'the-initiate': 'L’Initié',
  'the-monstrous': 'Le Monstre',
  'the-mundane': 'L’Ordinaire',
  'the-paromantic-tom': 'the-paromantic-tom',
  'the-professional': 'Le Professionnel',
  'the-searcher-tom': 'the-searcher-tom',
  'the-snoop-he': 'Le Fureteur [HE]',
  'the-spell-slinger': 'Le Magicien',
  'the-spooktacular-he': 'the-spooktacular-he',
  'the-spooky': 'L’Épouvantail',
  'the-wronged': 'Le Vengeur',
  'weird-basic-moves-tom': 'Manœuvres bizarres [ToM]',
};

generateJson(inputDirectory, outputDir, compendiumLabels);
