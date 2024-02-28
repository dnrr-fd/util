// @ts-check
export class LocaleParam {
    isParam?: boolean;
    locale?: string;

    constructor(
        isParam?:boolean,
        locale?:string) {
            this.isParam = isParam;
            this.locale = locale;
    }
}

export function getNormalizedLocale() {
    // Dynamically load modules
    const result = import('@arcgis/core/intl').then(intl => {
        return intl.getLocale().toLowerCase().slice(0, 2);
    });
    return result;
}

export async function loadLocale(locale: string, configlocales: Array<string>) {
    // Check if the new locale is in the list of locales in the config list. If so try and open the js file in i18n/
    // otherwise just return the default default_i18n
    const lang = await getNormalizedLocale();
    const configlocalesUC = configlocales.map(locale => locale.toUpperCase());

    if (!configlocalesUC.includes(locale.toUpperCase())) {
        const message = `Locale (${locale}) is not configured in this application. Please check index_config.json. Using default (${lang}).`;
        locale = lang;
        window.alert(message);
    }

    // Dynamically load modules
    const result = import('@arcgis/core/intl').then(intl => {
        intl.setLocale(locale)
    });
    document.documentElement.lang = locale;

    return locale;
}

export async function getLocaleParam() {
    return new Promise(async resolve => {
        // Dynamically load modules
        const { getQueryStringValue } = await import('./web');

        const lang = await getNormalizedLocale();
        const localeparam = getQueryStringValue("locale");

        const lp = new LocaleParam();
        let locale = lang;
        let isParam = false;

        if (localeparam != null) {
            isParam = true;
            if (localeparam.toUpperCase() != lang && localeparam.toUpperCase() != "EN") {
                locale = localeparam;
            }
        }
        lp.isParam = isParam;
        lp.locale = locale;

        resolve(lp);
    });
}