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
import type { ElementType } from 'react'

import Typography from '@mui/material/Typography'
import type { TypographyProps } from '@mui/material/Typography'

import { onlyText } from './intlHelpers'

import type { iReplace } from './intlHelpers'

// Material Components

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
  component?: ElementType
}

export type { iReplace } from './intlHelpers'

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
