import { APP_INITIALIZER, LOCALE_ID } from "@angular/core";
import {
  I18NEXT_SERVICE,
  I18NextModule,
  I18NextLoadResult,
  ITranslationService,
  defaultInterpolationFormat,
} from "angular-i18next";
import { InitOptions } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

const i18nextOptions: InitOptions = {
  supportedLngs: ["en", "el"],
  debug: false,
  fallbackLng: "en",
  backend: {
    loadPath: "./assets/locales/{{lng}}/{{ns}}.json",
    addPath: "./assets/locales/add/{{lng}}/{{ns}}",
    allowMultiLoading: false,
  },
  interpolation: {
    format: I18NextModule.interpolationFormat(defaultInterpolationFormat),
  },
};

export function appInit(i18next: ITranslationService) {
  return () => {
    let promise: Promise<I18NextLoadResult> = i18next
      .use(Backend)
      .use(LanguageDetector)
      .init(i18nextOptions);
    return promise;
  };
}

export function localeIdFactory(i18next: ITranslationService) {
  return i18next.language;
}

export const I18N_PROVIDERS = [
  {
    provide: APP_INITIALIZER,
    useFactory: appInit,
    deps: [I18NEXT_SERVICE],
    multi: true,
  },
  {
    provide: LOCALE_ID,
    deps: [I18NEXT_SERVICE],
    useFactory: localeIdFactory,
  },
];
