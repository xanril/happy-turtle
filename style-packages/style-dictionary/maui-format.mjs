const FORMAT_NAME = 'maui/resource-dictionary';
const KEYS_FORMAT_NAME = 'maui/resource-keys';

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const toPascalCase = (name) => name
  .split(/[^a-zA-Z0-9]+/)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('');

const toMauiColor = (value) => {
  const color = String(value).trim();
  const rgba = color.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/i);

  if (rgba) {
    const [, red, green, blue, alpha] = rgba;
    const alphaHex = Math.round(Number(alpha) * 255).toString(16).padStart(2, '0');
    const channels = [red, green, blue]
      .map((channel) => Number(channel).toString(16).padStart(2, '0'))
      .join('');
    return `#${alphaHex}${channels}`.toUpperCase();
  }

  return color.toUpperCase();
};

const toMauiNumber = (value) => {
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return value.value;
  }

  const number = String(value).trim().match(/^(-?(?:\d+\.?\d*|\.\d+))(?:px)?$/i);
  return number ? number[1] : value;
};

const toFontAttributes = (value) => {
  const numericWeight = Number(value);
  if (Number.isFinite(numericWeight)) {
    return numericWeight >= 600 ? 'Bold' : 'None';
  }

  return /bold/i.test(String(value)) ? 'Bold' : 'None';
};

const resource = (element, key, value) => ({
  element,
  key: toPascalCase(key),
  value
});

const renderResource = ({ element, key, value }) =>
  `    <${element} x:Key="${escapeXml(key)}">${escapeXml(value)}</${element}>`;

const tokenResources = (token) => {
  const type = token.$type ?? token.type ?? token.original?.$type ?? token.original?.type;
  const value = token.$value ?? token.value;
  const isColor = type === 'color'
    || (token.path.includes('color') && /^(?:#|rgba?\()/i.test(String(value).trim()));

  if (type === 'typography' && typeof value === 'object' && value !== null) {
    return [
      resource('x:String', `${token.name}-family`, value.fontFamily),
      resource('x:Double', `${token.name}-size`, toMauiNumber(value.fontSize)),
      resource('FontAttributes', `${token.name}-weight`, toFontAttributes(value.fontWeight))
    ];
  }

  if (isColor) {
    return [resource('Color', token.name, toMauiColor(value))];
  }

  if (type === 'dimension' || type === 'fontSize') {
    return [resource('x:Double', token.name, toMauiNumber(value))];
  }

  if (type === 'fontWeight' || (token.path.includes('typo') && token.path.includes('weight'))) {
    return [resource('FontAttributes', token.name, toFontAttributes(value))];
  }

  if (type === 'fontFamily' || type === 'string') {
    return [resource('x:String', token.name, value)];
  }

  return [];
};

const resourceDefinitions = (dictionary) => dictionary.allTokens
  .toSorted((left, right) => left.name.localeCompare(right.name))
  .flatMap(tokenResources);

export const mauiResourceDictionaryFormat = {
  name: FORMAT_NAME,
  format: ({ dictionary, file }) => {
    const className = file.options?.className;
    if (!className) {
      throw new Error('maui/resource-dictionary requires file.options.className');
    }

    const resources = resourceDefinitions(dictionary)
      .map(renderResource)
      .join('\n');

    return `<?xml version="1.0" encoding="utf-8" ?>
<ResourceDictionary
    xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
    xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
    x:Class="${escapeXml(className)}">
${resources}
</ResourceDictionary>
`;
  }
};

export const mauiResourceKeysFormat = {
  name: KEYS_FORMAT_NAME,
  format: ({ dictionary, file }) => {
    const namespace = file.options?.namespace;
    const className = file.options?.className;
    if (!namespace || !className) {
      throw new Error('maui/resource-keys requires namespace and className options');
    }

    const constants = resourceDefinitions(dictionary)
      .map(({ key }) => `    public const string ${key} = nameof(${key});`)
      .join('\n');

    return `namespace ${namespace};

public static class ${className}
{
${constants}
}
`;
  }
};