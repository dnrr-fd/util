// @ts-check
import * as intl from "@arcgis/core/intl";
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Accessor from '@arcgis/core/core/Accessor';
import { getQueryStringValue } from "./web";

@subclass('LocaleParam')
export class LocaleParam extends Accessor {
    //----------------------------------
    //  Properties
    //----------------------------------
    @property()
    isParam!: boolean

    @property()
    locale!: string
}

export function  getNormalizedLocale() {
    return intl.getLocale().toLowerCase().slice(0, 2);
}

export function loadLocale(locale: string, configlocales: Array<string>) {
    // Check if the new locale is in the list of locales in the config list. If so try and open the js file in i18n/
    // otherwise just return the default default_i18n
    const lang = getNormalizedLocale();
    const configlocalesUC = configlocales.map(locale => locale.toUpperCase());

    if (!configlocalesUC.includes(locale.toUpperCase())) {
        const message = `Locale (${locale}) is not supported in this application. Please check index_config.json. Using default (${lang}).`;
        locale = lang;
        window.alert(message);
    }

    intl.setLocale(locale)

    return locale;
}

export async function getLocaleParam() {
    return new Promise(resolve => {
        const lang = intl.getLocale().toLowerCase().slice(0, 2);
        const localeparam = getQueryStringValue("locale");

        const lp = new LocaleParam();
        let locale = lang;
        let isParam = false;

        if (localeparam != null) {
            isParam = true;
            if (localeparam.toUpperCase() != intl.getLocale().toUpperCase().slice(0, 2) && localeparam.toUpperCase() != "EN") {
                locale = localeparam;
            }
        }
        lp.isParam = isParam;
        lp.locale = locale;

        resolve(lp);
    });
}