# Happy Turtle MAUI demo

This iOS and Android app consumes the `HappyTurtle.Styles` NuGet package published to GitHub Packages
from `xanril/happy-turtle`. It
switches between the typed `LightTokens` and `DarkTokens` resource dictionaries, presents the same
six semantic colors as the Angular demo, and previews the generated typography scale.

## Prerequisites

- .NET 10 SDK with the MAUI workload. `HappyTurtle.Styles` requires `Microsoft.Maui.Controls` 10.0.20 or
  later; if restore fails with `NU1605: Detected package downgrade`, run `dotnet workload update`.
- Xcode at the version required by the installed .NET iOS workload
- Android SDK platform required by the installed .NET Android workload
- A GitHub account. The package is public, but GitHub Packages requires an authenticated token for every
  NuGet restore, even of public packages. Any account works; no access grant from the package owner is needed.

Install missing MAUI or Android dependencies with:

```sh
dotnet workload install maui
dotnet build HappyTurtle.Demo.csproj -t:InstallAndroidDependencies -f net10.0-android -p:AcceptAndroidSDKLicenses=true
```

## Authenticate to GitHub Packages

The project pins `HappyTurtle.Styles` `0.0.0-test.20261019064041`, the same version as the Angular demo's
npm package. The app's `NuGet.config` restores `HappyTurtle.*` packages from the `xanril` GitHub Packages
feed and everything else from nuget.org. It reads the feed credentials from environment variables and
does not contain any.

Authenticate GitHub CLI with `read:packages`, then expose your username and token for the restore:

```sh
gh auth login --scopes read:packages
export GITHUB_USERNAME="$(gh api user -q .login)"
export NUGET_AUTH_TOKEN="$(gh auth token)"
```

Without GitHub CLI, create a classic personal access token with the `read:packages` scope (GitHub →
Settings → Developer settings → Personal access tokens) and set `NUGET_AUTH_TOKEN` to it. A missing or
unscoped token makes the restore fail with `401 Unauthorized` for `HappyTurtle.Styles`.

## Update to a new version

The `Publish MAUI styles` workflow publishes the NuGet package. Publishing a GitHub release runs it
together with the npm workflow, so both packages get the release's version. To publish manually, from the
repository root:

```sh
GH_PROMPT_DISABLED=1 gh workflow run publish-maui-styles.yml --ref main \
  -f version=0.0.0-test.YYYYMMDDHHMMSS
```

Then set the new version on the `HappyTurtle.Styles` `PackageReference` in `HappyTurtle.Demo.csproj` and
restore. Never reuse a published version.

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