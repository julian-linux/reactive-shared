import each from 'lodash/each'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import isObject from 'lodash/isObject'

/**
 * Object type for replacement values in translations.
 * Used to replace placeholders in translation strings using the format ${key}.
 */
export interface iReplace {
  [key: string]: string | number
}

/**
 * Structure for nested translation objects.
 */
export interface LangTranslationsProps {
  [key: string]: string | LangTranslationsProps
}

/**
 * Cache object for storing processed translations to improve performance.
 */
const replacedCached: iReplace = {}

/**
 * Global translations object set via initLangCode function.
 */
let translations: LangTranslationsProps

/**
 * Retrieves a translation value by key from the translations object.
 */
const getKey = (key: string): string => {
  if (isEmpty(translations)) return 'NO_LANGCODE_DEFINED'

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return get(translations, key, `##${key}##`)
}

/**
 * Creates a regex pattern for finding and replacing placeholders in translations.
 */
const replaceRegex = (key: string) => new RegExp(`\\$\\{${key}\\}`, 'g')

/**
 * Initialize the translation system with a translations object.
 */
export const initLangCode = (newTranslations: LangTranslationsProps): void => {
  translations = newTranslations
}

/**
 * Function signature for the onlyText utility function.
 */
export type OnlyTextProps = (langKey: string, replace?: iReplace, noCache?: boolean) => string

/**
 * Get translated text without rendering a React component.
 */
export const onlyText: OnlyTextProps = (langKey, replace = undefined, noCache = false): string => {
  let text = getKey(langKey)

  if (replace == null) {
    return text
  }

  if (!isObject(replace)) {
    throw new Error(`Intl Error ->> Bad Replace structure in ---> ${langKey}`)
  }

  if (replacedCached[langKey] !== undefined) {
    return replacedCached[langKey] as string
  }

  each(replace, (value: string | number, key: string) => {
    const regex = replaceRegex(key.toString())

    if (!regex.test(text)) {
      throw new Error(`Intl Error ->> key -- ${key} -- not defined translation in ---> ${langKey}`)
    }

    text = text.replace(replaceRegex(key), value.toString())
  })

  if (!noCache) {
    replacedCached[langKey] = text
  }

  return text
}
