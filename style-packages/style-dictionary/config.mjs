import { baseConfig, register } from '@ama-styling/style-dictionary';
import StyleDictionary from 'style-dictionary';
import { mauiResourceDictionaryFormat, mauiResourceKeysFormat } from './maui-format.mjs';

const sharedSources = [
  'packages/design-tokens/*km-foundations.amadeus.tokens.json',
  'packages/design-tokens/*.styles.tokens.json'
];

const modes = ['Light', 'Dark'];

for (const mode of modes) {
  const platforms = {
    css: {
      transformGroup: 'ama/css/recommended',
      buildPath: 'packages/angular-styles/dist/',
      options: {
        outputReferences: true
      },
      files: [{
        destination: `${mode.toLowerCase()}.css`,
        format: 'ama/css/variable'
      }]
    }
  };

  platforms.maui = {
    transforms: [
      'attribute/cti',
      'name/kebab',
      'color/css',
      'ama/transform/ratio',
      'ama/transform/unit'
    ],
    buildPath: 'packages/maui-styles/',
    files: [{
      destination: `Styles/${mode}Tokens.xaml`,
      format: 'maui/resource-dictionary',
      options: {
        className: `HappyTurtle.Styles.${mode}Tokens`
      }
    }, ...(mode === 'Light' ? [{
      destination: 'StyleKeys.cs',
      format: 'maui/resource-keys',
      options: {
        namespace: 'HappyTurtle.Styles',
        className: 'StyleKeys'
      }
    }] : [])]
  };

  const styleDictionary = new StyleDictionary({
    ...baseConfig,
    usesDtcg: true,
    source: [
      `packages/design-tokens/*km-palette.${mode}.tokens.json`,
      ...sharedSources,
      `packages/design-tokens/*km-general.${mode}.tokens.json`
    ],
    platforms
  });

  register(styleDictionary);
  styleDictionary.registerFormat(mauiResourceDictionaryFormat);
  styleDictionary.registerFormat(mauiResourceKeysFormat);
  await styleDictionary.buildPlatform('css');
  await styleDictionary.buildPlatform('maui');
}