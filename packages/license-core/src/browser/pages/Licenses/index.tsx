import React from 'react'
import { inject, injectable } from 'inversify'
import {
    RouteContribution,
    RouteDocumentLinkDefinition,
    RouteDocumentMetaDefinition,
    RoutePrerenderConfig,
    RoutesApplicationContribution,
} from '@authlance/core/lib/common/routes/routes'
import { GroupAction, GroupActionContribution } from '@authlance/identity/lib/browser/common/contributions'
import { LicensesProvider } from '../../common/licenses-sdk'
import { LicensesGroupContent } from '../../components/licenses/LicensesGroupContent'
import { LicensesPricingContent } from '../../components/licenses/LicensesPricingContent'
import { ProductsAdminContent } from '../../components/licenses/ProductsAdminContent'
import { ProductCreateContent } from '../../components/licenses/ProductCreateContent'
import { ProductEditContent } from '../../components/licenses/ProductEditContent'
import { ProductCouponsContent } from '../../components/licenses/ProductCouponsContent'
import { ProductCouponCreateContent } from '../../components/licenses/ProductCouponCreateContent'
import { ProductCouponEditContent } from '../../components/licenses/ProductCouponEditContent'
import LicensesTrialRequestContent from '../../components/licenses/LicensesTrialRequestContent'
import { LICENSES_CATEGORY } from '../../common/categories'
import { HeaderAction, MainActionContribution } from '@authlance/core/lib/browser/common/ui-contributions'
import { AuthSession } from '@authlance/core/lib/browser/hooks/useAuth'
import { Plus, ShieldCheck, ShoppingBasket } from 'lucide-react'
import { LicenseProductContext } from '../../common/types'

const LicensesMyGroupPage: React.FC = () => (
    <LicensesProvider>
        <LicensesGroupContent mode="session" />
    </LicensesProvider>
)

const LicensesGroupPageComponent: React.FC = () => (
    <LicensesProvider>
        <LicensesGroupContent />
    </LicensesProvider>
)

const LicensesPricingPage: React.FC = () => (
        <LicensesProvider>
            <LicensesPricingContent />
        </LicensesProvider>
    )


const LicensesAdminProductsPage: React.FC = () => (
    <LicensesProvider>
        <ProductsAdminContent />
    </LicensesProvider>
)

const LicensesAdminProductCreatePage: React.FC = () => (
    <LicensesProvider>
        <ProductCreateContent />
    </LicensesProvider>
)

const LicensesAdminProductEditPage: React.FC = () => (
    <LicensesProvider>
        <ProductEditContent />
    </LicensesProvider>
)

const LicensesAdminProductCouponsPage: React.FC = () => (
    <LicensesProvider>
        <ProductCouponsContent />
    </LicensesProvider>
)

const LicensesAdminProductCouponCreatePage: React.FC = () => (
    <LicensesProvider>
        <ProductCouponCreateContent />
    </LicensesProvider>
)

const LicensesAdminProductCouponEditPage: React.FC = () => (
    <LicensesProvider>
        <ProductCouponEditContent />
    </LicensesProvider>
)

const LicensesTrialRequestPage: React.FC = () => (
    <LicensesProvider>
        <LicensesTrialRequestContent />
    </LicensesProvider>
)

const PRICING_PAGE_TITLE = 'Authlance Pricing'
const PRICING_DESCRIPTION =
    'Compare Authlance annual subscriptions and one-off licensing plans, including managed product tiers, coupons, and checkout automation.'
const PRICING_KEYWORDS =
    'Authlance pricing, self-hosted licensing, subscription plans, software licensing, Stripe automation'
const PRICING_CANONICAL_URL = buildPricingCanonicalUrl()
const PRICING_DOCUMENT_META = buildPricingMeta(
    PRICING_PAGE_TITLE,
    PRICING_DESCRIPTION,
    PRICING_KEYWORDS,
    PRICING_CANONICAL_URL
)
const PRICING_DOCUMENT_LINKS: RouteDocumentLinkDefinition[] = [
    {
        attributes: {
            rel: 'canonical',
            href: PRICING_CANONICAL_URL,
        },
    },
]

const PRICING_PRERENDER_CONFIG: RoutePrerenderConfig = {
    enabled: true,
    document: {
        title: `${PRICING_PAGE_TITLE} — Self-hosted billing & licensing`,
        meta: PRICING_DOCUMENT_META,
        links: PRICING_DOCUMENT_LINKS,
    },
}

function buildPricingMeta(
    title: string,
    description: string,
    keywords: string,
    canonicalUrl: string
): RouteDocumentMetaDefinition[] {
    const fullTitle = `${title} — Self-hosted billing & licensing`
    const metaCandidates: (RouteDocumentMetaDefinition | undefined)[] = [
        description
            ? {
                  attributes: {
                      name: 'description',
                      content: description,
                  },
              }
            : undefined,
        keywords
            ? {
                  attributes: {
                      name: 'keywords',
                      content: keywords,
                  },
              }
            : undefined,
        {
            attributes: {
                property: 'og:title',
                content: fullTitle,
            },
        },
        description
            ? {
                  attributes: {
                      property: 'og:description',
                      content: description,
                  },
              }
            : undefined,
        {
            attributes: {
                property: 'og:type',
                content: 'website',
            },
        },
        {
            attributes: {
                property: 'og:url',
                content: canonicalUrl,
            },
        },
        {
            attributes: {
                name: 'twitter:card',
                content: 'summary',
            },
        },
        {
            attributes: {
                name: 'twitter:title',
                content: fullTitle,
            },
        },
        description
            ? {
                  attributes: {
                      name: 'twitter:description',
                      content: description,
                  },
              }
            : undefined,
        {
            attributes: {
                name: 'twitter:url',
                content: canonicalUrl,
            },
        },
    ]
    return metaCandidates.filter((entry): entry is RouteDocumentMetaDefinition =>
        Boolean(entry && entry.attributes?.content)
    )
}

function buildPricingCanonicalUrl(): string {
    const env = typeof process !== 'undefined' ? process.env ?? {} : {}
    const rawBase =
        (typeof env.AUTHLANCE_PUBLIC_URL === 'string' && env.AUTHLANCE_PUBLIC_URL.trim()) ||
        (typeof env.ROOT_APP_URL === 'string' && env.ROOT_APP_URL.trim()) ||
        (typeof env.APP_URL === 'string' && env.APP_URL.trim()) ||
        'https://authlance.com'
    const normalizedBase = rawBase.replace(/\/+$/, '') || 'https://authlance.com'
    return `${normalizedBase}/pricing`
}

@injectable()
export class LicensesPricingPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/pricing',
            component: LicensesPricingPage,
            navBar: false,
            canGoBack: true,
            name: 'Pricing',
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: false,
            prerender: PRICING_PRERENDER_CONFIG,
        }
    }
}

@injectable()
export class LicensesAdminProductsPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/licenses/admin/products',
            component: LicensesAdminProductsPage,
            category: LICENSES_CATEGORY,
            icon: <ShoppingBasket />,
            navBar: true,
            canGoBack: false,
            name: 'Product catalog',
            exact: true,
            root: true,
            forceParent: '/',
            authRequired: true,
            roles: ['sysadmin'],
        }
    }
}

@injectable()
export class LicensesAdminProductCreatePageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/licenses/admin/products/new',
            component: LicensesAdminProductCreatePage,
            navBar: false,
            canGoBack: true,
            name: 'Create license product',
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: true,
        }
    }
}

@injectable()
export class LicensesAdminProductEditPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/licenses/admin/products/:slug/edit',
            component: LicensesAdminProductEditPage,
            navBar: false,
            canGoBack: true,
            name: 'Edit license product',
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: true,
        }
    }
}

@injectable()
export class LicensesAdminProductCouponsPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/licenses/admin/products/:slug/coupons',
            component: LicensesAdminProductCouponsPage,
            navBar: false,
            canGoBack: true,
            name: 'Manage Coupons',
            exact: true,
            root: true,
            forceParent: '/',
            authRequired: true,
        }
    }
}

@injectable()
export class LicensesAdminProductCouponCreatePageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/licenses/admin/products/:slug/coupons/create',
            component: LicensesAdminProductCouponCreatePage,
            navBar: false,
            canGoBack: true,
            name: 'Add Coupon',
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: true,
        }
    }
}

@injectable()
export class LicensesAdminProductCouponEditPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/licenses/admin/products/:slug/coupons/:couponId/edit',
            component: LicensesAdminProductCouponEditPage,
            navBar: false,
            canGoBack: true,
            name: 'Edit Coupon',
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: true,
        }
    }
}

@injectable()
export class LicensesGroupPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/licenses/group',
            component: LicensesMyGroupPage,
            navBar: false,
            canGoBack: true,
            name: 'My licenses',
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: true,
        }
    }
}

@injectable()
export class LicensesGroupAdminPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/licenses/:groupName',
            component: LicensesGroupPageComponent,
            navBar: false,
            canGoBack: true,
            name: 'Group licenses',
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: true,
        }
    }
}

@injectable()
export class LicensesTrialRequestPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/licenses/group/trial',
            component: LicensesTrialRequestPage,
            navBar: false,
            canGoBack: true,
            name: 'Request trial license',
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: true,
        }
    }
}

@injectable()
export class NewLicenseMainActionContribution implements MainActionContribution {
    getAction(authContext: AuthSession, path: string): HeaderAction | undefined {
        if (!authContext.user || path !== '/licenses/admin/products') {
            return undefined
        }
        const isSysadmin = authContext.user.roles?.includes('sysadmin')
        if (!isSysadmin) {
            return undefined
        }
        return {
            label: 'New Product',
            icon: <Plus />,
            id: 'new-license-product',
            action(authContext) {
                if (authContext.navigateHandler) {
                    authContext.navigateHandler.navigate('/licenses/admin/products/new')
                }
            },
        }
    }
}

@injectable()
export class LicensesTrialRequestMainActionContribution implements MainActionContribution {
    getAction(authContext: AuthSession, path: string): HeaderAction | undefined {
        if (!authContext.user || path !== '/licenses/group') {
            return undefined
        }
        return {
            label: 'Request Trial',
            icon: <Plus />,
            id: 'request-trial-license',
            action(authContext) {
                if (authContext.navigateHandler) {
                    authContext.navigateHandler.navigate('/licenses/group/trial')
                }
            },
        }
    }
}

@injectable()
export class GroupLicensesGroupActionContribution implements GroupActionContribution {
    getAction(): GroupAction {
        return {
            label: 'Licenses',
            icon: <ShieldCheck />,
            action(authContext, group) {
                if (authContext.navigateHandler) {
                    authContext.navigateHandler.navigate(`/licenses/${group.name}`)
                }
            },
        }
    }
}

@injectable()
export class AddProductLicenseCouponseMainActionContribution implements MainActionContribution {
    constructor(@inject(LicenseProductContext) private licenseProductContext: LicenseProductContext) {
        // such empty
    }

    getAction(authContext: AuthSession, path: string): HeaderAction | undefined {
        if (!authContext.user || !path.startsWith('/licenses/admin/products/:slug/coupons')) {
            return undefined
        }
        const isSysadmin = authContext.user.roles?.includes('sysadmin')
        if (!isSysadmin) {
            return undefined
        }
        const ctx = this.licenseProductContext
        return {
            label: 'Add Coupon',
            icon: <Plus />,
            id: 'add-product-license-coupons',
            action(authContext) {
                const currentSlug = ctx.getCurrentProductSlug()
                if (!currentSlug) {
                    return
                }
                if (authContext.navigateHandler) {
                    authContext.navigateHandler.navigate(`/licenses/admin/products/${currentSlug}/coupons/create`)
                }
            },
        }
    }
}
