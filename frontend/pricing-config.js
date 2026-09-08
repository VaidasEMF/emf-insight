/*
 * EMF Insight pricing configuration
 *
 * This file is the single frontend source for displayed commercial values.
 * Payment processing is intentionally NOT connected to these values yet.
 * Later this configuration can be moved to the backend/admin settings so
 * prices and currencies can be changed without editing the Dashboard UI.
 */

window.EMF_PRICING = {
    defaultCurrency: "EUR",

    supportedCurrencies: ["EUR", "USD"],

    currencies: {
        EUR: {
            code: "EUR",
            symbol: "€",
            locale: "en-IE"
        },
        USD: {
            code: "USD",
            symbol: "$",
            locale: "en-US"
        }
    },

    home: {
        fullReport: {
            name: "Full EMF Insight Report",
            type: "one_time",
            prices: {
                EUR: 9,
                USD: 9
            }
        }
    },

    business: {
        single: {
            name: "Single Report",
            type: "one_time",
            credits: 1,
            prices: {
                EUR: 9,
                USD: 9
            }
        },
        pro: {
            name: "Pro",
            type: "monthly",
            credits: 5,
            prices: {
                EUR: 19,
                USD: 19
            }
        },
        premium: {
            name: "Premium",
            type: "tbd",
            credits: null,
            prices: {}
        }
    }
};
