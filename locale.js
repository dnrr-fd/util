import * as intl from "@arcgis/core/intl";
export function getNormalizedLocale() {
    return intl.getLocale().toLowerCase().slice(0, 2);
}
export function loadLocale(locale, configlocales) {
    // Check if the new locale is in the list of locales in the config list. If so try and open the js file in i18n/
    // otherwise just return the default default_i18n
    var lang = getNormalizedLocale();
    var configlocalesUC = configlocales.map(locale => locale.toUpperCase());
    if (!configlocalesUC.includes(locale.toUpperCase())) {
        var message = `Locale (${locale}) is not supported in this application. Please check index_config.json. Using default (${lang}).`;
        locale = lang;
        window.alert(message);
    }
    intl.setLocale(locale);
    return locale;
}
//# sourceMappingURL=locale.js.map