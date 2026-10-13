import { baseConfig, register } from '@ama-styling/style-dictionary';
import StyleDictionary from 'style-dictionary';

const sharedSources = [
  'packages/design-tokens/*km-foundations.amadeus.tokens.json',
  'packages/design-tokens/*.styles.tokens.json'
];

const modes = ['Light', 'Dark'];

for (const mode of modes) {
  const styleDictionary = new StyleDictionary({
    ...baseConfig,
    usesDtcg: true,
    source: [
      `packages/design-tokens/*km-palette.${mode}.tokens.json`,
      ...sharedSources,
      `packages/design-tokens/*km-general.${mode}.tokens.json`
    ],
    platforms: {
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
    }
  });

  register(styleDictionary);
  await styleDictionary.buildPlatform('css');
}