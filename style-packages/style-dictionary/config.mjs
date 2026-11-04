import { baseConfig, register } from '@ama-styling/style-dictionary';
import StyleDictionary from 'style-dictionary';
import { mauiResourceDictionaryFormat, mauiResourceKeysFormat } from './maui-format.mjs';

// Theming is defined by the [T2] semantic modes, which alias different palette steps per mode.
// The [T0] palette is therefore always resolved from its default (Light) mode, as Figma does when
// only the semantic collection's mode is switched. Using the inverted Dark palette here would
// double-invert every semantic color, making dark.css resolve to the same values as light.css.
const sharedSources = [
  'packages/design-tokens/*km-palette.Light.tokens.json',
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