// =====================
// 🔥 EXPORT PNG
// =====================

function exportCanvasImage() {

    if (!canvas) {
        return;
    }

    // =====================
    // 🔥 FILE NAME
    // =====================

    const date =

        new Date()

            .toISOString()

            .slice(0, 19)

            .replaceAll(
                ":",
                "-"
            );

    const fileName =

        "emf-report-" +

        date +

        ".png";

    // =====================
    // 🔥 EXPORT
    // =====================

    const link =
        document.createElement(
            "a"
        );

    link.download =
        fileName;

    link.href =
        canvas.toDataURL(
            "image/png"
        );

    link.click();

    updateStatus?.(
        "🖼 PNG exported"
    );
}

// =====================
// 🔥 BUSINESS PDF
// =====================

function getHomePurchaseCurrency() {

    const currency =
        window.EMF_SELECTED_CURRENCY ||
        localStorage.getItem("emf_selected_currency") ||
        "EUR";

    return String(currency).toUpperCase();
}

async function getHomePurchasePrice(currency) {

    const storedPrice =
        Number(
            localStorage.getItem(
                "emf_home_full_report_price"
            )
        );

    if (
        Number.isFinite(storedPrice) &&
        storedPrice > 0
    ) {
        return storedPrice;
    }

    try {

        const response =
            await fetch("/pricing");

        if (!response.ok) {
            throw new Error(
                `Pricing request failed: ${response.status}`
            );
        }

        const pricing =
            await response.json();

        const region =
            pricing.default_region ||
            "EU";

        const selectedCurrency =
            currency ||
            pricing.default_currency ||
            "EUR";

        const homePrice =
            pricing
                ?.regions
                ?.[region]
                ?.products
                ?.HOME_FULL_REPORT
                ?.price;

        if (
            Number.isFinite(
                Number(homePrice)
            ) &&
            Number(homePrice) > 0
        ) {

            return Number(homePrice);

        }

        console.warn(
            "Home Full Report price not found in pricing API.",
            {
                region,
                selectedCurrency,
                pricing
            }
        );

    }
    catch (error) {

        console.error(
            "Unable to load Home Full Report pricing.",
            error
        );

    }

    return null;
}

function formatHomePurchasePrice(
    price,
    currency
) {

    if (!Number.isFinite(Number(price))) {
        return "";
    }

    try {

        return new Intl.NumberFormat(
            undefined,
            {
                style: "currency",
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        ).format(Number(price));

    }
    catch {

        return `${currency} ${price}`;

    }
}


async function openHomeUnlockCta() {

    document
        .getElementById(
            "homeUnlockModal"
        )
        ?.remove();


    const currency =
        getHomePurchaseCurrency();


    const price =
        await getHomePurchasePrice(
            currency
        );


    const priceText =
        formatHomePurchasePrice(
            price,
            currency
        );


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "homeUnlockModal";


    modal.className =
        "room-modal";


    modal.innerHTML = `

        <div
            class="room-modal-card floor-modal-card"
            style="
                max-width: 550px;
                padding: 28px;
            "
        >

            <h2
                class="room-modal-title"
                style="
                    margin-bottom: 12px;
                "
            >
                Unlock Full EMF Insight Report
            </h2>


            <p
                style="
                    margin: 0;
                    color: #64748b;
                    font-size: 16px;
                    line-height: 1.6;
                "
            >
                Unlock the complete report for this
                Home Project, including detailed analysis,
                recommendations and the professional PDF report.
            </p>


            <div
                style="
                    margin-top: 20px;
                    color: #111827;
                    font-size: 15px;
                    font-weight: 700;
                "
            >
                ${
                    priceText
                        ? `${priceText} one-time · This Home Project`
                        : `One-time purchase · This Home Project`
                }
            </div>


            <button
                class="room-save-btn"
                id="homeUnlockCtaButton"
                style="
                    width: 100%;
                    margin-top: 22px;
                "
            >
                Unlock Full Report →
            </button>


            <button
                type="button"
                id="homeUnlockCancelButton"
                style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 10px;
                    padding: 8px 4px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                "
            >
                Not now
            </button>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    const close =
        () => modal.remove();


    document
        .getElementById(
            "homeUnlockCancelButton"
        )
        ?.addEventListener(
            "click",
            close
        );


    document
        .getElementById(
            "homeUnlockCtaButton"
        )
        ?.addEventListener(
            "click",
            async () => {

                close();

                if (
                    typeof buyPlan ===
                    "function"
                ) {

                    await buyPlan(
                        "home_full_report"
                    );

                    return;
                }


                console.warn(
                    "buyPlan() is not available."
                );

            }
        );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {
                close();
            }

        }
    );

}

function generateBusinessPdf() {

    // HOME — Full Report is paid.
    if (
        window.AppMode?.current === "home" &&
        window.homeFullReportUnlocked !== true
    ) {
        openHomeUnlockCta();
        return;
    }

    // BUSINESS / UNLOCKED HOME
    if (
        typeof generatePDF === "function"
    ) {
        generatePDF();
        return;
    }

    alert(
        "PDF generation is not available."
    );
}

// =====================
// 🔥 BUSINESS CSV
// =====================

function exportBusinessCsv() {

    alert(
        "Business CSV Export coming soon"
    );
}

// =====================
// 🔥 RESULTS DASHBOARD
// =====================

function openResultsDashboard() {

    // ==================================================
    // HOME — FREE RESULTS
    //
    // Never call Business Results for a Home Project.
    // ==================================================

    if (
        window.AppMode?.current === "home"
    ) {

        updateCurrentExposure?.();

        const panel =
            document.getElementById(
                "liveAnalysisPanel"
            );

        if (panel) {

            panel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
        else {

            console.warn(
                "Home Results panel not found."
            );

        }

        return;
    }


    // ==================================================
    // BUSINESS
    // ==================================================

    if (
        typeof openBusinessResults ===
        "function"
    ) {

        openBusinessResults();
        return;

    }

    console.warn(
        "Business Results function unavailable."
    );
}


// =====================
// 🔥 EXPORTS
// =====================

window.exportCanvasImage =
    exportCanvasImage;

window.generateBusinessPdf =
    generateBusinessPdf;

window.exportBusinessCsv =
    exportBusinessCsv;

window.openResultsDashboard =
    openResultsDashboard;