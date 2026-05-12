/**
 * @fileoverview Internationalization utilities for React components with Material-UI Typography
 * 
 * # Setup
 * Before using Intl components, initialize translations:
 * ```typescript
 * import { initLangCode } from './utils/intl'
 * 
 * const translations = {
 *   "welcome": "Welcome to our app!",
 *   "user": {
 *     "greeting": "Hello ${name}!",
 *     "messages": "You have ${count} new messages"
 *   }
 * }
 * 
 * initLangCode(translations)
 * ```
 * 
 * # Usage Examples
 * ```tsx
 * // Simple text
 * <Intl langKey="welcome" />
 * 
 * // With variables
 * <Intl langKey="user.greeting" replace={{ name: "John" }} />
 * 
 * // With Typography props
 * <Intl langKey="welcome" variant="h1" color="primary" />
 * 
 * // HTML content (use with caution)
 * <Intl langKey="rich.content" transpileHTML />
 * ```
 */

// Libraries
import React from 'react'
import get from 'lodash/get'
import isObject from 'lodash/isObject'
import each from 'lodash/each'
import isEmpty from 'lodash/isEmpty'

// Material Components
import Typography, { TypographyProps } from '@mui/material/Typography'

/**
 * Object type for replacement values in translations.
 * Used to replace placeholders in translation strings using the format ${key}.
 * 
 * @example 
 * ```typescript
 * // For translation: "Hello ${name}, you have ${count} messages"
 * const replace: iReplace = { 
 *   name: "John", 
 *   count: 5 
 * }
 * ```
 */
interface iReplace {
  /** Key-value pairs where key matches placeholder name and value is the replacement */
  [key: string]: string | number
}

/**
 * Structure for nested translation objects.
 * Supports both flat strings and nested objects for organized translations.
 * 
 * @example 
 * ```typescript
 * const translations: LangTranslationsProps = {
 *   "common": {
 *     "save": "Save",
 *     "cancel": "Cancel",
 *     "delete": "Delete"
 *   },
 *   "errors": {
 *     "required": "This field is required",
 *     "email": "Please enter a valid email"
 *   },
 *   "welcome": "Welcome to our application!"
 * }
 * ```
 */
interface LangTranslationsProps {
  /** Translation key can be either a string value or nested translation object */
  [key: string]: string | LangTranslationsProps
}

/**
 * Props for the Intl component, extending Material-UI Typography properties.
 * Provides internationalization capabilities with variable replacement and HTML support.
 */
export interface IntlProps extends TypographyProps {
  /** 
   * The translation key to look up in the translations object.
   * Supports dot notation for nested keys (e.g., "user.profile.name").
   * 
   * @example
   * ```tsx
   * <Intl langKey="common.save" />
   * <Intl langKey="errors.validation.email" />
   * ```
   */
  langKey: string
  
  /** 
   * Object for replacing placeholders in translations.
   * Placeholders should be in format ${key} in your translation files.
   * 
   * @example 
   * ```tsx
   * // For translation: "Hello ${name}, you have ${count} messages"
   * <Intl 
   *   langKey="user.greeting" 
   *   replace={{ name: "John", count: 5 }} 
   * />
   * ```
   */
  replace?: iReplace
  
  /** 
   * Whether to render the translation as HTML using dangerouslySetInnerHTML.
   * Use with caution and only with trusted content to avoid XSS attacks.
   * 
   * @default false
   * @example
   * ```tsx
   * // For translation containing HTML: "Welcome <strong>back</strong>!"
   * <Intl langKey="welcome.html" transpileHTML />
   * ```
   */
  transpileHTML?: boolean
  
  /** 
   * Whether to bypass caching and re-process the translation on each render.
   * Useful for dynamic content that changes frequently or during development.
   * 
   * @default false
   * @example
   * ```tsx
   * <Intl langKey="dynamic.timestamp" noCache />
   * ```
   */
  noCache?: boolean
  
  /** 
   * React children (typically not used as content comes from langKey).
   * Included for compatibility with TypographyProps.
   */
  children?: React.ReactNode
  
  /** 
   * Override the rendered component type.
   * Inherited from Material-UI Typography component prop.
   */
  component?: string
}

/**
 * Cache object for storing processed translations to improve performance.
 * Key is the langKey, value is the processed translation string.
 */
const replacedCached: iReplace = {}

/**
 * Global translations object set via initLangCode function.
 * Contains all available translations for the current language.
 */
let translations: LangTranslationsProps

/**
 * Retrieves a translation value by key from the translations object.
 * 
 * @param key - The translation key (supports dot notation for nested access)
 * @returns The translation string or a fallback indicator if not found
 * @internal
 */
const getKey = (key: string): string => {
  if (isEmpty(translations)) return 'NO_LANGCODE_DEFINED'

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return get(translations, key, `##${key}##`)
}

/**
 * Creates a regex pattern for finding and replacing placeholders in translations.
 * 
 * @param key - The placeholder key name
 * @returns RegExp pattern for matching ${key} format
 * @internal
 */
const replaceRegex = (key: string) => new RegExp(`\\$\\{${key}\\}`, "g") // eslint-disable-line

/**
 * Initialize the translation system with a translations object.
 * This function must be called before using any Intl components.
 * 
 * @param newTranslations - The translations object containing all language strings
 * 
 * @example
 * ```typescript
 * const translations = {
 *   "welcome": "Welcome to our app!",
 *   "user": {
 *     "greeting": "Hello ${name}!",
 *     "messages": {
 *       "single": "You have 1 message",
 *       "multiple": "You have ${count} messages"
 *     }
 *   }
 * }
 * 
 * initLangCode(translations)
 * ```
 */
export const initLangCode = (newTranslations: LangTranslationsProps): void => {
  translations = newTranslations
}

/**
 * Function signature for the onlyText utility function.
 * Used for type checking and IntelliSense support.
 */
export type OnlyTextProps = (langKey: string, replace?: iReplace, noCache?: boolean) => string

/**
 * Get translated text without rendering a React component.
 * Useful for getting translations in non-JSX contexts (e.g., form validation messages, alerts).
 * 
 * @param langKey - Translation key (supports dot notation for nested keys)
 * @param replace - Object with values to replace placeholders in the format ${key}
 * @param noCache - Skip caching for dynamic content that changes frequently
 * @returns Translated and processed string
 * 
 * @throws {Error} When replace object structure is invalid
 * @throws {Error} When a placeholder key is not found in the translation
 * 
 * @example
 * ```typescript
 * // Simple usage
 * const message = onlyText('welcome.message')
 * 
 * // With replacements
 * const greeting = onlyText('user.greeting', { name: 'John' })
 * 
 * // For form validation
 * const errorMsg = onlyText('validation.required', { field: 'Email' })
 * 
 * // Dynamic content without caching
 * const timestamp = onlyText('current.time', { time: new Date().toISOString() }, true)
 * ```
 */
export const onlyText: OnlyTextProps = (langKey, replace = undefined, noCache = false) => {
  let text = getKey(langKey)

  if (replace == null) {
    return text
  }

  if (!isObject(replace)) {
    throw new Error(`Intl Error ->> Bad Replace structure in ---> ${langKey}`)
  }

  if (replacedCached[langKey] !== undefined) {
    return replacedCached[langKey]
  }

  each(replace, (value: string | number, key: string) => {
    const regex = replaceRegex(key.toString())

    if (!regex.test(text)) {
      throw new Error(`Intl Error ->> key -- ${key} -- not defined translation in ---> ${langKey}`)
    }

    text = text.replace(replaceRegex(key), value.toString())
  }
  )

  if (!noCache) {
    replacedCached[langKey] = text
  }

  return text
}

/**
 * Internal React functional component that handles the rendering logic.
 * Wrapped by React.memo for performance optimization.
 * 
 * @param props - IntlProps containing all component configuration
 * @returns JSX.Element - Material-UI Typography component with translated content
 * @internal
 */
const IntlContainer: React.FC<IntlProps> = ({ langKey, replace, transpileHTML = false, noCache = false, ...props }) => {
  if (transpileHTML) {
    return (
      <Typography
        {...props}
        data-langkey={langKey}
        dangerouslySetInnerHTML={{ __html: onlyText(langKey, replace, noCache) }}
      />
    )
  }

  return (
    <Typography {...props} data-langkey={langKey}>
      {onlyText(langKey, replace, noCache)}
    </Typography>
  )
}

/**
 * Internationalization component that renders translated text with Material-UI Typography.
 * Supports variable replacement, HTML content, caching, and all Material-UI Typography props.
 * 
 * This component is memoized for performance optimization and will only re-render when props change.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Intl langKey="welcome.message" />
 * 
 * // With variable replacement
 * <Intl 
 *   langKey="user.greeting" 
 *   replace={{ name: "John", count: 5 }} 
 * />
 * 
 * // With Material-UI Typography props
 * <Intl 
 *   langKey="page.title"
 *   variant="h1" 
 *   color="primary"
 *   gutterBottom
 * />
 * 
 * // With HTML content (use with trusted content only)
 * <Intl 
 *   langKey="rich.content" 
 *   transpileHTML={true}
 *   variant="body1" 
 * />
 * 
 * // Without caching for dynamic content
 * <Intl 
 *   langKey="live.update" 
 *   replace={{ timestamp: Date.now() }}
 *   noCache={true}
 * />
 * ```
 */
export const Intl: React.NamedExoticComponent<IntlProps> = React.memo(IntlContainer)

export default Intl
