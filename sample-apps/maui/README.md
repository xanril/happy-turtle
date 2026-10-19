# Happy Turtle MAUI demo

This iOS and Android app consumes the locally generated `HappyTurtle.Styles` NuGet package. It
switches between the typed `LightTokens` and `DarkTokens` resource dictionaries, presents the same
six semantic colors as the Angular demo, and previews the generated typography scale.

## Prerequisites

- .NET 10 SDK with the MAUI workload
- Xcode at the version required by the installed .NET iOS workload
- Android SDK platform required by the installed .NET Android workload

Install missing MAUI or Android dependencies with:

```sh
dotnet workload install maui
dotnet build HappyTurtle.Demo.csproj -t:InstallAndroidDependencies -f net10.0-android -p:AcceptAndroidSDKLicenses=true
```

## Prepare the style package

From the repository root:

```sh
cd style-packages
npm ci
npm run pack
```

The app's `NuGet.config` reads `HappyTurtle.Styles.0.0.0.nupkg` from
`style-packages/packages/maui-styles/dist/`. The project uses its own ignored `.packages/` folder so
repacking the local development version does not reuse a stale copy from the global NuGet cache.

## Use package resources

Import the package namespace and merge one typed theme dictionary:

```xml
xmlns:styles="clr-namespace:HappyTurtle.Styles;assembly=HappyTurtle.Styles"

<styles:LightTokens />
```

Use the generated `StyleKeys` members instead of handwritten resource-name strings. After typing
`styles:StyleKeys.` in XAML or `StyleKeys.` in C#, the available package resources appear in autocomplete:

```xml
TextColor="{DynamicResource {x:Static styles:StyleKeys.KmColorPrimary}}"
```

```csharp
label.SetDynamicResource(Label.TextColorProperty, StyleKeys.KmColorPrimary);
```

## Restore and build

```sh
cd sample-apps/maui
dotnet restore
dotnet build -f net10.0-ios
dotnet build -f net10.0-android
```

## Run

Choose an available simulator or emulator:

```sh
dotnet build -t:Run -f net10.0-ios
dotnet build -t:Run -f net10.0-android
```