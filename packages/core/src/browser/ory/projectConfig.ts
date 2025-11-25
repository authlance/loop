import { AccountExperienceConfiguration, AccountExperienceConfigurationLocaleBehaviorEnum } from '@ory/client'

export const projectConfig: AccountExperienceConfiguration = {
    name: process.env.ORY_PROJECT_NAME || 'Authlance',
    default_locale: process.env.ORY_DEFAULT_LOCALE || 'en',
    enabled_locales: (process.env.ORY_ENABLED_LOCALES
        ?.split(',')
        .map((locale) => locale.trim())
        .filter(Boolean) ?? [process.env.ORY_DEFAULT_LOCALE || 'en']),
    default_redirect_url: process.env.ORY_DEFAULT_REDIRECT_URL || '/',
    error_ui_url: process.env.ORY_ERROR_UI_URL || '/error',
    login_ui_url: process.env.ORY_LOGIN_UI_URL || '/login',
    registration_ui_url: process.env.ORY_REGISTRATION_UI_URL || '/register',
    recovery_ui_url: process.env.ORY_RECOVERY_UI_URL || '/recovery',
    verification_ui_url: process.env.ORY_VERIFICATION_UI_URL || '/verify',
    settings_ui_url: process.env.ORY_SETTINGS_UI_URL || '/settings',
    registration_enabled: process.env.ORY_REGISTRATION_ENABLED !== 'false',
    recovery_enabled: process.env.ORY_RECOVERY_ENABLED !== 'false',
    verification_enabled: process.env.ORY_VERIFICATION_ENABLED !== 'false',
    logo_light_url: process.env.ORY_LOGO_LIGHT_URL || '/logo.svg',
    locale_behavior: AccountExperienceConfigurationLocaleBehaviorEnum.RespectAcceptLanguage,
    translations: [],
}
