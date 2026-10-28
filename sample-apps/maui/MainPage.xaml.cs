using System.Collections.ObjectModel;
using System.Reflection;
using HappyTurtle.Styles;

namespace HappyTurtle.Demo;

public partial class MainPage : ContentPage
{
	private static readonly (string Name, string ResourceKey)[] SemanticColors =
	[
		("Primary", StyleKeys.KmColorPrimary),
		("Accent", StyleKeys.KmColorAccent),
		("Success", StyleKeys.KmColorSuccess),
		("Warning", StyleKeys.KmColorWarning),
		("Danger", StyleKeys.KmColorDanger),
		("Tip", StyleKeys.KmColorTip)
	];

	private ResourceDictionary themeDictionary;

	public ObservableCollection<ColorSwatch> Colors { get; } = [];

	public string StylesVersion { get; } = GetStylesVersion();

	public MainPage()
	{
		themeDictionary = Application.Current!.Resources.MergedDictionaries.OfType<LightTokens>().Single();
		BindingContext = this;
		InitializeComponent();
		ApplyTheme(themeDictionary, AppTheme.Light);
		LoadColors();
	}

	private void OnThemeToggled(object? sender, ToggledEventArgs e)
	{
		var application = Application.Current!;
		var dictionaries = application.Resources.MergedDictionaries;
		dictionaries.Remove(themeDictionary);
		themeDictionary = e.Value ? new DarkTokens() : new LightTokens();
		dictionaries.Add(themeDictionary);
		ApplyTheme(themeDictionary, e.Value ? AppTheme.Dark : AppTheme.Light);

		var themeName = e.Value ? "Dark" : "Light";
		ThemeLabel.Text = themeName;
		ThemeFactLabel.Text = themeName;
		LoadColors();
	}

	private static void ApplyTheme(ResourceDictionary dictionary, AppTheme appTheme)
	{
		var application = Application.Current!;
		foreach (var resource in dictionary)
		{
			application.Resources[resource.Key] = resource.Value;
		}

		var isDark = appTheme == AppTheme.Dark;
		application.Resources["DemoText"] = dictionary[isDark ? StyleKeys.BaseBase200 : StyleKeys.BaseBase900];
		application.Resources["DemoTextStrong"] = dictionary[isDark ? StyleKeys.BasePaper : StyleKeys.BaseBase950];
		application.Resources["DemoMuted"] = dictionary[isDark ? StyleKeys.BaseBase400 : StyleKeys.BaseBase600];
		application.Resources["DemoBorder"] = dictionary[isDark ? StyleKeys.BaseBase700 : StyleKeys.BaseBase200];
		application.UserAppTheme = appTheme;
	}

	private static string GetStylesVersion()
	{
		var assembly = typeof(StyleKeys).Assembly;
		var version = assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion
			?? assembly.GetName().Version?.ToString()
			?? "Unknown";

		// Drop SourceLink build metadata (e.g. "+<commit sha>") to match the NuGet package version.
		var metadataIndex = version.IndexOf('+');
		return metadataIndex >= 0 ? version[..metadataIndex] : version;
	}

	private void LoadColors()
	{
		Colors.Clear();
		foreach (var (name, resourceKey) in SemanticColors)
		{
			if (themeDictionary[resourceKey] is Color color)
			{
				Colors.Add(ColorSwatch.Create(name, resourceKey, color));
			}
		}
	}
}

public sealed record ColorSwatch(string Name, string ResourceKey, Color Value, Color Foreground)
{
	public static ColorSwatch Create(string name, string resourceKey, Color value)
	{
		var luminance = (0.2126 * value.Red) + (0.7152 * value.Green) + (0.0722 * value.Blue);
		var foreground = luminance > 0.52 ? Colors.Black : Colors.White;
		return new ColorSwatch(name, resourceKey, value, foreground);
	}
}
