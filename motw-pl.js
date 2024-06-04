Hooks.on('init', async () => {
  game.settings.register('motw-pr', 'autoRegisterBabel', {
    name: 'Automatyczne włączenie tłumaczenia za pomocą Babele',
    hint: 'Automatycznie włącza tłumaczenia w Babele, bez konieczności wskazywania katalogu zawierającego tłumaczenia.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
    requiresReload: true,
    onChange: value => {
      if (value) {
        autoRegisterBabel();
      }
    },
  });

  game.settings.register('motw-pr', 'setBaseCompendiumsFolders', {
    name: 'Uporządkowanie podstawowych kompendiów w folderach',
    hint: 'Upewnij się, że kompendia obsługiwane przez moduł podstawowy są umieszczone w folderach, aby ułatwić ich przeglądanie.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
    requiresReload: true,
  });

  game.settings.register('motw-pr', 'basePlaybooksFolder', {
    scope: 'world',
    config: false,
    type: String,
  });

  game.settings.register('motw-pr', 'baseMovesFolder', {
    scope: 'world',
    config: false,
    type: String,
  });

  if (game.settings.get('motw-pr', 'autoRegisterBabel')) {
    autoRegisterBabel();
  }

  Babele.get().registerConverters({
    resultLabel: (value) => {
      switch (value) {
        case 'Success!':
          return 'Succès !';
        case 'Partial success':
          return 'Succès partiel';
        case 'Miss...':
          return 'Échec...';
        default:
          return value;
      }
    },
  });
});

Hooks.on('ready', async () => {
  await setCompendiumsFolders();
});

function autoRegisterBabel() {
  if (typeof Babele !== 'undefined') {
    Babele.get().register({
      module: 'motw-pl',
      lang: 'fr',
      dir: 'compendium/fr',
    });
  }
}

async function setCompendiumsFolders() {
  if (game.settings.get('motw-pr', 'setBaseCompendiumsFolders')) {
    await prepareCompendiumsFolders();
  }

  await processPlaybooks();
  await processMoves();

  if (!game.settings.get('motw-pr', 'setBaseCompendiumsFolders')) {
    await cleanupCompendiumsFolders();
  }
}

async function processPlaybooks() {
  let folder = null;

  if (game.settings.get('motw-pr', 'setBaseCompendiumsFolders')) {
    folder = game.folders.get(game.settings.get('motw-pr', 'basePlaybooksFolder'));
    if (!folder) {
      ui.notifications.error('Nie można znaleźć folderu z podstawowymi kompendiami.');

      return;
    }
  }

  const packs = [
    'motw-for-pbta.the-chosen', 'motw-for-pbta.the-crooked', 'motw-for-pbta.the-divine', 'motw-for-pbta.the-expert',
    'motw-for-pbta.the-flake', 'motw-for-pbta.the-initiate', 'motw-for-pbta.the-monstrous', 'motw-for-pbta.the-mundane',
    'motw-for-pbta.the-professional', 'motw-for-pbta.the-spell-slinger', 'motw-for-pbta.the-spooky',
    'motw-for-pbta.the-wronged', 'motw-for-pbta.the-gumshoe-tom', 'motw-for-pbta.the-hex-tom',
    'motw-for-pbta.the-pararomantic-tom', 'motw-for-pbta.the-searcher-tom', 'motw-for-pbta.the-snoop-he',
    'motw-for-pbta.the-spooktacular-he',
  ];

  for (const pack of packs) {
    await game.packs.get(pack)?.setFolder(folder);
  }
}

async function processMoves() {
  let folder = null;

  if (game.settings.get('motw-pr', 'setBaseCompendiumsFolders')) {
    folder = game.folders.get(game.settings.get('motw-pl', 'baseMovesFolder'));
    if (!folder) {
      ui.notifications.error('Nie można znaleźć folderu z ruchami.');

      return;
    }
  }

  const packs = [
    'motw-for-pbta.basic-moves', 'motw-for-pbta.other-moves',
    'motw-for-pbta.weird-basic-moves-tom', 'motw-for-pbta.special-moves-tom',
  ];

  for (const pack of packs) {
    await game.packs.get(pack)?.setFolder(folder);
  }
}

async function prepareCompendiumsFolders() {
  const basePlaybooks = game.folders.get(game.settings.get('motw-pl', 'basePlaybooksFolder'));
  if (!basePlaybooks) {
    const folders = await Folder.createDocuments([{
      name: 'Kompenida- Moduł podstawowe',
      type: 'Compendium',
      sorting: 'a',
    }]);

    await game.settings.set('motw-pl', 'basePlaybooksFolder', folders[0]._id);
  }

  const baseMoves = game.folders.get(game.settings.get('motw-pl', 'baseMovesFolder'));
  if (!baseMoves) {
    const folders = await Folder.createDocuments([{
      name: 'Ruchy',
      type: 'Compendium',
      sorting: 'a',
    }]);

    await game.settings.set('motw-pl', 'baseMovesFolder', folders[0]._id);
  }
}

async function cleanupCompendiumsFolders() {
  const basePlaybooks = game.folders.get(game.settings.get('motw-pl', 'basePlaybooksFolder'));
  const baseMoves = game.folders.get(game.settings.get('motw-pl', 'baseMovesFolder'));

  basePlaybooks?.delete();
  baseMoves?.delete();
}
