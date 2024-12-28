'use client';

import { useCallback, type ReactNode, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  useI18n,
  type Translations,
  I18nContext,
  defaultTranslations,
  type LocaleItem,
} from './contexts/i18n';

interface I18nProviderProps {
  /**
   * Current locale
   */
  locale: string;

  /**
   * Translations of current locale
   */
  translations?: Partial<Translations>;

  /**
   * Available languages
   */
  locales?: LocaleItem[];

  /**
   * Handle changes to the locale, redirect user when not specified.
   */
  onChange?: (v: string) => void;

  children: ReactNode;
}

export function I18nProvider({
  locales = [],
  locale,
  ...props
}: I18nProviderProps) {
  const context = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  const onChangeCallback = (locale: string) => {
    const segments = pathname.split('/').filter((v) => v.length > 0);
    const availableLocales = locales.map((l) => l.locale);
    
    // Check if first segment is a valid locale
    const isFirstSegmentLocale = segments.length > 0 && availableLocales.some(l => 
      l === segments[0]
    );

    if (isFirstSegmentLocale) {
      segments[0] = locale;
    } else {
      segments.unshift(locale);
    }

    router.push(`/${segments.join('/')}`);
    router.refresh();
  };

  const onChangeRef = useRef(onChangeCallback);
  onChangeRef.current = onChangeCallback;

  const onChange = useCallback((v: string) => onChangeRef.current(v), []);

  return (
    <I18nContext.Provider
      value={{
        locale,
        locales,
        text: {
          ...context.text,
          ...props.translations,
        },
        onChange: props.onChange ?? onChange,
      }}
    >
      {props.children}
    </I18nContext.Provider>
  );
}

export { defaultTranslations, type Translations };
