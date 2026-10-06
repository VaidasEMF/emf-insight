/* =========================================================
   HOME DEMO WORKSPACE
   Read-only Home Wellness Demo
   ========================================================= */

(function () {

    function esc(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       ROOT
       ===================================================== */

    function getHomeDemoRoot() {

        let root =
            document.getElementById(
                "homeDemoWorkspace"
            );

        if (root) {
            return root;
        }

        const main =
            document.querySelector(
                ".main-content"
            );

        if (!main) {
            console.warn(
                "⚠️ Home Demo: .main-content not found"
            );

            return null;
        }

        root =
            document.createElement("div");

        root.id =
            "homeDemoWorkspace";

        root.style.display =
            "none";

        main.appendChild(root);

        return root;
    }


    /* =====================================================
       STYLES
       ===================================================== */

    function injectStyles() {

        if (
            document.getElementById(
                "homeDemoWorkspaceStyles"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "homeDemoWorkspaceStyles";

        style.textContent = `

        #homeDemoWorkspace {
            width: 100%;
            box-sizing: border-box;
            padding: 24px 28px 60px;
            background: #f7f9fc;
            min-height: 100%;
            overflow: visible;
        }

        .hd-demo-shell {
            max-width: 1500px;
            margin: 0 auto;
        }

        


       /* =================================================
   HOME DEMO — HERO BANNER
   ================================================= */

.hd-demo-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;

    padding: 28px 30px;

    min-height: 190px;

    background:
        linear-gradient(
            105deg,
            #eef5ff 0%,
            #f4f8ff 55%,
            #edf4ff 100%
        );

    border: 1px solid #cbdff5;
    border-radius: 16px;

    box-sizing: border-box;
}


/* LEFT CONTENT */

.hd-demo-banner-content {
    flex: 1 1 auto;
    min-width: 0;
    max-width: 820px;
}


.hd-demo-banner-kicker {
    margin: 0 0 8px;

    color: #5d85ab;

    font-size: 13px;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
}


.hd-demo-banner h1 {
    margin: 0 0 10px;

    color: #071b2e;

    font-size: 30px;
    line-height: 1.15;
    font-weight: 750;
}


.hd-demo-banner p {
    margin: 0;

    max-width: 760px;

    color: #4c6c88;

    font-size: 16px;
    line-height: 1.5;
    font-weight: 450;
}


/* READ-ONLY BADGE */

.hd-demo-readonly {
    display: inline-flex;
    align-items: center;

    margin-top: 16px;

    padding: 7px 12px;

    background: rgba(255,255,255,.82);

    border: 1px solid #d5e2ef;
    border-radius: 8px;

    color: #526b82;

    font-size: 12px;
    font-weight: 650;
}


/* CTA */

.hd-demo-banner .hd-demo-primary-btn {
    flex: 0 0 auto;

    min-width: 310px;

    min-height: 50px;

    padding: 0 20px;

    border-radius: 10px;

    font-size: 14px;
    font-weight: 750;

    white-space: nowrap;
}

        /* =================================================
           PROPERTY HEADER
           ================================================= */

        .hd-property-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;

            padding: 20px 22px;
            margin-bottom: 18px;

            background: #ffffff;
            border: 1px solid #e0e6ed;
            border-radius: 14px;
        }

        .hd-property-name {
            margin: 0;

            font-size: 22px;
            line-height: 1.2;
            font-weight: 750;

            color: #172333;
        }

        .hd-property-meta {
            margin-top: 7px;

            font-size: 13px;
            color: #718092;
        }

        .hd-demo-badge {
            flex: 0 0 auto;

            padding: 6px 10px;

            border-radius: 7px;

            background: #f3f6f9;
            border: 1px solid #dce3ea;

            font-size: 10px;
            font-weight: 800;
            letter-spacing: .06em;

            color: #657586;
        }


        /* =================================================
           NAVIGATION
           ================================================= */

        .hd-demo-nav {
            display: flex;
            align-items: center;
            gap: 4px;

            padding: 6px;
            margin-bottom: 20px;

            background: #ffffff;
            border: 1px solid #e0e6ed;
            border-radius: 11px;
        }

        .hd-demo-nav-item {
            padding: 9px 14px;

            border-radius: 8px;

            font-size: 12px;
            font-weight: 700;

            color: #6b7887;

            cursor: default;
        }

        .hd-demo-nav-item.active {
            background: #eef5ff;
            color: #315f91;
        }


        /* =================================================
           OVERVIEW GRID
           ================================================= */

        .hd-overview-grid {
    display: grid;
    grid-template-columns: minmax(0, 2.4fr) minmax(300px, 0.9fr);
    gap: 20px;
    align-items: stretch;
}


        /* =================================================
           PROPERTY MAP
           ================================================= */

        .hd-map-card {
            min-height: 390px;

            padding: 22px;

            background: #ffffff;
            border: 1px solid #e0e6ed;
            border-radius: 14px;
        }

        .hd-card-kicker {
            margin-bottom: 5px;

            font-size: 10px;
            font-weight: 800;
            letter-spacing: .08em;
            text-transform: uppercase;

            color: #718092;
        }

        .hd-card-title {
            margin: 0;

            font-size: 18px;
            font-weight: 750;

            color: #172333;
        }

        .hd-map-area {
    width: 100%;
    min-height: 420px;
    overflow: hidden;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f6fa;
}

        .hd-map-room {
            position: absolute;

            display: flex;
            align-items: center;
            justify-content: center;

            box-sizing: border-box;

            border: 2px solid #aebdca;
            background: rgba(255, 255, 255, .82);

            font-size: 12px;
            font-weight: 750;

            color: #536576;
        }

        .hd-map-room.sleep {
            left: 7%;
            top: 10%;
            width: 37%;
            height: 40%;
        }

        .hd-map-room.work {
            right: 7%;
            top: 10%;
            width: 37%;
            height: 40%;
        }

        .hd-map-room.rest {
            left: 25%;
            bottom: 8%;
            width: 50%;
            height: 34%;
        }

        .hd-map-label {
            position: absolute;

            left: 12px;
            bottom: 10px;

            font-size: 10px;
            font-weight: 700;

            color: #7a8997;
        }


        .hd-floor-plan-image {
    display: block;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 420px;
    object-fit: contain;
}


        /* =================================================
           ENVIRONMENT OVERVIEW
           ================================================= */

        .hd-environment-card {
            padding: 22px;

            background: #ffffff;
            border: 1px solid #e0e6ed;
            border-radius: 14px;
        }

        .hd-environment-status {
            margin-top: 14px;

            padding: 16px;

            border-radius: 10px;

            background: #f4f8f5;
            border: 1px solid #dce9df;
        }

        .hd-environment-status-label {
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .06em;
            text-transform: uppercase;

            color: #718092;
        }

        .hd-environment-status-value {
            margin-top: 5px;

            font-size: 20px;
            font-weight: 750;

            color: #355b42;
        }

        .hd-environment-status-text {
            margin-top: 6px;

            font-size: 12px;
            line-height: 1.45;

            color: #657566;
        }


        /* =================================================
           KPI GRID
           ================================================= */

        .hd-kpi-grid {
            display: grid;

            grid-template-columns: 1fr 1fr;

            gap: 10px;

            margin-top: 14px;
        }

        .hd-kpi {
            padding: 13px;

            border: 1px solid #e1e7ed;
            border-radius: 10px;

            background: #fafbfd;
        }

        .hd-kpi-value {
            font-size: 21px;
            line-height: 1;

            font-weight: 750;

            color: #253443;
        }

        .hd-kpi-label {
            margin-top: 5px;

            font-size: 10px;
            line-height: 1.3;

            color: #748293;
        }


        /* =================================================
           LIFESTYLE
           ================================================= */

        .hd-section {
            margin-bottom: 20px;
        }

        .hd-section-header {
            margin-bottom: 10px;
        }

        .hd-section-title {
            margin: 0;

            font-size: 18px;
            font-weight: 750;

            color: #172333;
        }

        .hd-section-subtitle {
            margin-top: 4px;

            font-size: 12px;

            color: #758394;
        }

        .hd-lifestyle-grid {
            display: grid;

            grid-template-columns:
                repeat(3, minmax(0, 1fr));

            gap: 14px;
        }

        .hd-lifestyle-card {
            padding: 18px;

            background: #ffffff;
            border: 1px solid #e0e6ed;
            border-radius: 12px;
        }

        .hd-lifestyle-name {
            font-size: 15px;
            font-weight: 750;

            color: #273747;
        }

        .hd-lifestyle-exposure {
            margin-top: 9px;

            font-size: 12px;
            font-weight: 700;

            color: #657586;
        }

        .hd-lifestyle-priority {
            display: inline-flex;

            margin-top: 12px;
            padding: 4px 7px;

            border-radius: 6px;

            background: #f4f6f8;

            font-size: 10px;
            font-weight: 750;

            color: #6b7886;
        }


        .hd-demo-banner-action {
            flex: 0 0 auto;
        }

        .hd-demo-primary-btn {
            display: inline-flex;
            align-items: center;
            gap: 10px;

            padding: 12px 17px;

            border: 0;
            border-radius: 8px;

            background: #2563eb;
            color: #ffffff;

            font-size: 12px;
            font-weight: 750;

            cursor: default;
        }

        .hd-demo-primary-btn span {
            font-size: 15px;
        }


        .hd-lifestyle-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.hd-lifestyle-status {
    padding: 4px 7px;

    border-radius: 6px;

    background: #f2f7f3;

    font-size: 10px;
    font-weight: 750;

    color: #4f7058;
}

.hd-lifestyle-description {
    margin-top: 10px;

    font-size: 12px;
    line-height: 1.45;

    color: #718092;
}

.hd-lifestyle-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-top: 15px;

    font-size: 10px;
    color: #7a8795;
}

.hd-lifestyle-footer strong {
    color: #536273;
}

.hd-demo-link {
    font-weight: 750;
    color: #3569a3;
}

.hd-source-grid {
    display: grid;

    grid-template-columns:
        repeat(3, minmax(0, 1fr));

    gap: 12px;
}

.hd-source-card {
    display: flex;
    align-items: center;
    gap: 12px;

    padding: 15px;

    background: #ffffff;
    border: 1px solid #e0e6ed;
    border-radius: 11px;
}

.hd-source-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 38px;
    height: 38px;

    flex: 0 0 38px;

    border-radius: 9px;

    background: #f1f5f9;

    font-size: 9px;
    font-weight: 800;

    color: #607286;
}

.hd-source-content {
    min-width: 0;
    flex: 1;
}

.hd-source-name {
    font-size: 13px;
    font-weight: 750;

    color: #273747;
}

.hd-source-location {
    margin-top: 3px;

    font-size: 10px;

    color: #7a8795;
}

.hd-source-level {
    padding: 4px 7px;

    border-radius: 6px;

    background: #f4f6f8;

    font-size: 9px;
    font-weight: 750;

    color: #687686;
}


.hd-recommendation-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.hd-recommendation-card {
    display: flex;
    align-items: flex-start;
    gap: 13px;

    padding: 16px;

    background: #ffffff;
    border: 1px solid #e0e6ed;
    border-radius: 11px;
}

.hd-recommendation-number {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 28px;
    height: 28px;

    flex: 0 0 28px;

    border-radius: 50%;

    background: #eef5ff;

    font-size: 11px;
    font-weight: 800;

    color: #3569a3;
}

.hd-recommendation-content {
    flex: 1;
}

.hd-recommendation-title {
    font-size: 13px;
    font-weight: 750;

    color: #273747;
}

.hd-recommendation-text {
    margin-top: 5px;

    font-size: 11px;
    line-height: 1.45;

    color: #718092;
}

.hd-recommendation-priority {
    padding: 4px 7px;

    border-radius: 6px;

    background: #f4f6f8;

    font-size: 9px;
    font-weight: 750;

    color: #697787;
}

.hd-professional-grid {
    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 16px;

    margin-top: 22px;
}

.hd-professional-card {
    padding: 22px;

    background: #eef7f1;
    border: 1px solid #d4e8da;
    border-radius: 14px;
}

.hd-professional-card-secondary {
    background: #f5f8fc;
    border-color: #dce5ef;
}

.hd-professional-kicker {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .07em;

    color: #587565;
}

.hd-professional-card-secondary
.hd-professional-kicker {
    color: #5f7082;
}

.hd-professional-title {
    margin: 7px 0 0;

    font-size: 17px;
    line-height: 1.25;

    color: #20332a;
}

.hd-professional-card-secondary
.hd-professional-title {
    color: #263646;
}

.hd-professional-text {
    margin: 8px 0 16px;

    max-width: 560px;

    font-size: 12px;
    line-height: 1.5;

    color: #66776b;
}

.hd-professional-card-secondary
.hd-professional-text {
    color: #6d7b89;
}

.hd-professional-primary,
.hd-professional-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    padding: 10px 13px;

    border-radius: 8px;

    font-size: 11px;
    font-weight: 750;

    cursor: default;
}

.hd-professional-primary {
    border: 0;

    background: #218a50;
    color: #ffffff;
}

.hd-professional-card-secondary
.hd-professional-primary {
    background: #3569a3;
}

.hd-professional-primary span {
    font-size: 14px;
}

.hd-professional-secondary {
    margin-left: 7px;

    border: 1px solid #cfd9e2;

    background: #ffffff;
    color: #566777;
}


/* ==================================================
   HOME DEMO — PROFESSIONAL SECTION
   ================================================== */

.hd-professional-section {
    margin-top: 42px;
    padding: 34px 30px 38px;
    background: #ffffff;
    border: 1px solid #dce4ec;
    border-radius: 18px;
}

.hd-section-heading {
    max-width: 760px;
    margin-bottom: 28px;
}

.hd-section-heading .hd-eyebrow {
    margin-bottom: 8px;
    color: #55706c;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
}

.hd-section-heading h2 {
    margin: 0 0 10px;
    color: #14252a;
    font-size: 24px;
    line-height: 1.25;
}

.hd-section-heading p {
    margin: 0;
    color: #60747a;
    font-size: 15px;
    line-height: 1.6;
}


.hd-professional-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
}


.hd-professional-card {
    display: flex;
    flex-direction: column;
    min-height: 330px;
    padding: 24px;
    background: #f8fafc;
    border: 1px solid #dce4ec;
    border-radius: 14px;
}


.hd-professional-number {
    margin-bottom: 18px;
    color: #6b7f86;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
}

/* ==================================================
   PROFESSIONAL BENEFIT VISUALS
   ================================================== */

.hd-professional-visual {
    position: relative;
    height: 250px;
    margin: 0;
    padding: 0;
    overflow: hidden;
    border-radius: 12px 12px 0 0;
    background: transparent;
}

.hd-professional-visual img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
    margin: 0;
    padding: 0;
    border: 0;
}



.hd-professional-visual img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
}


/* BLUE — USE THE PLATFORM */

.hd-professional-visual-blue {
    background:
        linear-gradient(
            135deg,
            #eef6ff 0%,
            #f8fbff 100%
        );
    border: 1px solid #d7e8fb;
}


/* GREEN — GET CLIENTS */

.hd-professional-visual-green {
    background:
        linear-gradient(
            135deg,
            #eefaf3 0%,
            #f9fcfa 100%
        );
    border: 1px solid #d8eee1;
}


/* PURPLE — GET DISCOVERED */

.hd-professional-visual-purple {
    background:
        linear-gradient(
            135deg,
            #f5f1ff 0%,
            #fbfaff 100%
        );
    border: 1px solid #e4dcfb;
}


.hd-professional-card-content {
    display: flex;
    flex-direction: column;
}


.hd-professional-card h3 {
    margin: 0 0 10px;
    color: #16272c;
    font-size: 20px;
    line-height: 1.3;
}


.hd-professional-card p {
    margin: 0 0 20px;
    color: #60747a;
    font-size: 14px;
    line-height: 1.6;
}


.hd-professional-flow {
    margin-bottom: 24px;
    padding: 12px 14px;
    background: #ffffff;
    border: 1px solid #e1e7ed;
    border-radius: 9px;
    color: #50666d;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.8;
}


.hd-professional-flow span {
    margin: 0 4px;
    color: #8a9aa0;
}


.hd-professional-card .hd-demo-primary-btn,
.hd-professional-card .hd-demo-secondary-btn {
    margin-top: 18px;
}


/* ==================================================
   PROFESSIONAL CARDS — INTEGRATED HERO
   ================================================== */

.hd-professional-card {
    padding: 0;
    overflow: hidden;
    min-height: 0;
}


/* ==================================================
   HERO
   ================================================== */

.hd-professional-hero {
    position: relative;
    min-height: 225px;
    display: flex;
    overflow: hidden;
    border-radius: 13px 13px 0 0;
}


/* TEXT SIDE */

.hd-professional-hero-copy {
    position: relative;
    z-index: 3;
    width: 55%;
    padding: 22px 0 22px 22px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}


.hd-professional-number {
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
}


.hd-professional-hero-copy h3 {
    margin: 0 0 10px;
    font-size: 21px;
    line-height: 1.25;
    color: #16272c;
}


.hd-professional-hero-copy p {
    margin: 0;
    max-width: 290px;
    font-size: 14px;
    line-height: 1.55;
    color: #60747a;
}


/* =================================================
   PROFESSIONAL HERO
   ================================================= */

.hd-professional-hero {
    position: relative;
    height: 200px;
    min-height: 200px;

    margin: 0;
    padding: 20px 28px 20px;

    overflow: hidden;
    border-radius: 12px;

    background: linear-gradient(
        90deg,
        #f1f7ff 0%,
        #f4f9ff 48%,
        #eef6ff 100%
    );
}


}


/* =================================================
   HERO TEXT
   ================================================= */

.hd-professional-hero-copy {
    position: relative;
    z-index: 5;

    width: 45%;
}


/* NUMBER */

.hd-professional-hero-copy .hd-professional-number {
    position: relative;
    z-index: 5;

    margin: 0 0 12px;

    font-size: 24px;
    line-height: 1;

    font-weight: 800;
    letter-spacing: 0.02em;

    color: #2878d8;
}


/* TITLE */

.hd-professional-hero-copy h3 {
    position: relative;
    z-index: 5;

    margin: 0 0 12px;

    font-size: 25px;
    line-height: 1.15;

    font-weight: 750;

    color: #071b2e;
}


/* DESCRIPTION */

.hd-professional-hero-copy p {
    position: relative;
    z-index: 5;

    max-width: 255px;

    margin: 0;

    font-size: 15px;
    line-height: 1.55;

    font-weight: 500;

    color: #3f617d;
}


/* =================================================
   IMAGE
   ================================================= */

.hd-professional-hero-image {
    position: absolute;

    z-index: 1;

    top: 0;
    right: 0;

    width: 67%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: flex-end;

    margin: 0;
    padding: 0;
}


/* SOFT FADE BETWEEN TEXT AND IMAGE */

.hd-professional-hero-image::before {
    content: "";

    position: absolute;

    inset: 0;

    z-index: 2;

    pointer-events: none;

    background: linear-gradient(
        90deg,
        #f1f7ff 0%,
        rgba(241,247,255,.92) 10%,
        rgba(241,247,255,.35) 34%,
        rgba(241,247,255,0) 62%
    );
}


/* IMAGE ITSELF */

.hd-professional-hero-image img {
    position: relative;
    z-index: 1;

    display: block;

    width: 100%;
    height: 100%;

    margin: 0;
    padding: 0;

    object-fit: contain;
    object-position: right center;
}


/* =================================================
   SPACE BETWEEN HERO AND FLOW
   ================================================= */

.hd-professional-flow {
    margin-top: 10px !important;
}


/* ==================================================
   CARD BACKGROUNDS
   ================================================== */

.hd-professional-card-blue .hd-professional-hero {
    background: linear-gradient(
        135deg,
        #f4f9ff 0%,
        #eef6ff 100%
    );
}

.hd-professional-card-green .hd-professional-hero {
    background: linear-gradient(
        135deg,
        #f2faf5 0%,
        #eef9f2 100%
    );
}

.hd-professional-card-purple .hd-professional-hero {
    background: linear-gradient(
        135deg,
        #f8f5ff 0%,
        #f4f0ff 100%
    );
}

/* ==================================================
   PROFESSIONAL FLOW — RESTORE HORIZONTAL LAYOUT
   ================================================== */

.hd-professional-flow {
    margin: 0 14px;
    padding: 12px 8px;

    width: auto;
    box-sizing: border-box;

    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;

    align-items: center;
    justify-content: space-between;

    background: rgba(255, 255, 255, 0.78);
    border: 1px solid #dce5ec;
    border-radius: 10px;

    min-height: 86px;
}


.hd-flow-step {
    flex: 1 1 0;
    min-width: 0;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    text-align: center;
}


.hd-flow-arrow {
    flex: 0 0 24px;
    width: 24px;
    height: 48px;

    display: flex;
    align-items: center;
    justify-content: center;

    margin: 0;
    padding: 0;

    line-height: 1;
    font-size: 18px;
    font-weight: 500;

    position: relative;
    top: -8px;
}

.hd-flow-icon {
    width: 48px;
    height: 48px;

    flex: 0 0 48px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: transparent;
    border: none;
    border-radius: 10px;
}


.hd-flow-icon img {
    width: 48px;
    height: 48px;

    object-fit: contain;
    display: block;
}


.hd-flow-step > span:last-child {
    margin-top: 10px;

    color: #344b53;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.25;
}


.hd-flow-arrow-green {
    color: #159653;
}


.hd-flow-arrow-purple {
    color: #6546d8;
}

/* ==================================================
   FLOW ICONS
   ================================================== */

.hd-flow-icon {
    width: 38px;
    height: 38px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 10px;

    font-size: 20px;
    font-weight: 700;
}


.hd-flow-icon-blue {
    color: #1674dc;
    background: #eaf3ff;
}


.hd-flow-icon-green {
    color: #159653;
    background: #e9f8ef;
}


.hd-flow-icon-purple {
    color: #6546d8;
    background: #f0ebff;
}


/* simple visual glyphs */

.hd-icon-document::before {
    content: "▤";
}

.hd-icon-meter::before {
    content: "◉";
}

.hd-icon-analysis::before {
    content: "▥";
}

.hd-icon-report::before {
    content: "▧";
}

.hd-icon-home::before {
    content: "⌂";
}

.hd-icon-users::before {
    content: "♟";
}

.hd-icon-contact::before {
    content: "•••";
    letter-spacing: 1px;
}

.hd-icon-client::before {
    content: "↗";
}

.hd-icon-profile::before {
    content: "●";
}

.hd-icon-location::before {
    content: "●";
}

.hd-icon-discovery::before {
    content: "◉";
}


/* ==================================================
   PROFESSIONAL CTA
   ================================================== */

.hd-professional-cta {
    margin: 14px;
    width: calc(100% - 28px);

    min-height: 46px;
    padding: 0 18px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    border-radius: 9px;

    font-size: 13px;
    font-weight: 700;

    cursor: default;
}


.hd-professional-cta span {
    font-size: 17px;
}


/* BLUE */

.hd-professional-cta-blue {
    color: #ffffff;
    background: #2878d8;
    border: 1px solid #2878d8;
}


/* GREEN */

.hd-professional-cta-green {
    color: #159653;
    background: #ffffff;
    border: 1px solid #159653;
}


/* PURPLE */

.hd-professional-cta-purple {
    color: #ffffff;
    background: #6546d8;
    border: 1px solid #6546d8;
}

@media (max-width: 1050px) {

    .hd-professional-grid {
        grid-template-columns: 1fr;
    }

    .hd-professional-card {
    min-height: 0;
    padding: 18px;
}

}


@media (max-width: 700px) {

    .hd-professional-section {
        padding: 26px 20px 28px;
    }

}

/* =================================================
   HOME DEMO — SCROLL CONTAINER
   ================================================= */

body.home-demo-active .main-content {
    overflow-y: auto;
}


/* =================================================
   HOME DEMO — FIXED PROJECT HEADER
   ================================================= */

body.home-demo-active #projectHeader {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: #ffffff;
}


/* =================================================
   HOME DEMO — ALLOW FULL CONTENT SCROLL
   ================================================= */

body.home-demo-active #homeDemoWorkspace {
    min-height: max-content;
    overflow: visible;
}


        /* =================================================
           RESPONSIVE
           ================================================= */

        @media (max-width: 1050px) {

            .hd-overview-grid {
                grid-template-columns: 1fr;
            }

            .hd-lifestyle-grid {
                grid-template-columns:
                    repeat(2, minmax(0, 1fr));
            }
        }

        @media (max-width: 700px) {

            #homeDemoWorkspace {
                padding: 16px 14px 40px;
            }

            .hd-demo-banner,
            .hd-property-header {
                flex-direction: column;
            }

            .hd-demo-nav {
                overflow-x: auto;
            }

            .hd-lifestyle-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 800px) {

    .hd-professional-grid {
        grid-template-columns: 1fr;
    }

    .hd-source-grid {
        grid-template-columns: 1fr;
    }
}

/* ==================================================
   HOME DEMO — PROFESSIONAL CARDS FINAL LAYOUT
   ================================================== */

.hd-professional-card {
    min-height: 0;
    padding: 18px;
}

.hd-professional-card-content {
    display: block;
    flex: none;
}

.hd-professional-card .hd-demo-primary-btn,
.hd-professional-card .hd-demo-secondary-btn {
    margin-top: 18px;
}

.hd-professional-card .hd-demo-secondary-btn {
    background: #ffffff;
    border: 1px solid #b9cde3;
    color: #315b84;
    opacity: 1;
    cursor: default;
}

.hd-professional-card .hd-demo-secondary-btn:hover {
    background: #ffffff;
}


/* CARD ACCENTS */

.hd-professional-card:nth-child(1) {
    border-color: #cfe1f6;
}

.hd-professional-card:nth-child(1) .hd-professional-number {
    color: #2878d8;
}

.hd-professional-card:nth-child(2) {
    border-color: #d0eadb;
}

.hd-professional-card:nth-child(2) .hd-professional-number {
    color: #159653;
}

.hd-professional-card:nth-child(3) {
    border-color: #ddd4fa;
}

.hd-professional-card:nth-child(3) .hd-professional-number {
    color: #6546d8;
}


.hd-flow-icon {
    width: 42px;
    height: 42px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 10px;

    overflow: hidden;
}

.hd-flow-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}


.hd-professional-card-green
.hd-professional-flow
.hd-flow-step:nth-child(3)
.hd-flow-icon {
    position: relative;
    top: 2px;
}

.hd-professional-card-green
.hd-professional-flow
.hd-flow-step:nth-child(5)
.hd-flow-icon {
    position: relative;
    top: 1px;
}

.hd-professional-card-green
.hd-professional-flow
.hd-flow-step:nth-child(7)
.hd-flow-icon {
    position: relative;
    top: -1px;
}
    
    .hd-flow-icon-match {
    transform: translateY(5px);
}

.hd-professional-card-purple .hd-flow-icon {
    transform: translateY(8px);
}


.hd-professional-card-blue
.hd-flow-step:first-child
.hd-flow-icon img {
    transform: translateY(6px);
}

.hd-professional-card-green
.hd-flow-step:first-child
.hd-flow-icon img {
    transform: translateY(6px);
}


/* =================================================
   PROFESSIONAL CARD 02 — GET CLIENTS
   ================================================= */

.hd-professional-card-green .hd-professional-hero {
    background: linear-gradient(
        90deg,
        #effaf3 0%,
        #f3fbf6 48%,
        #edf9f2 100%
    );
}

.hd-professional-card-green .hd-professional-hero-copy {
    width: 46%;
}

.hd-professional-card-green .hd-professional-hero-image {
    width: 64%;
    right: 0;
}

.hd-professional-card-green .hd-professional-hero-image::before {
    background: linear-gradient(
        90deg,
        #effaf3 0%,
        rgba(239,250,243,.94) 12%,
        rgba(239,250,243,.42) 35%,
        rgba(239,250,243,0) 63%
    );
}

.hd-professional-card-green .hd-professional-hero-image img {
    object-position: right center;
}


/* =================================================
   HOME DEMO — PROPERTY HEALTH RECORD HEADER
   ================================================= */

.hd-property-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;

    padding: 24px 28px;

    background: #ffffff;

    border: 1px solid #dbe5ef;
    border-radius: 16px;

    box-sizing: border-box;
}


.hd-property-header-main {
    min-width: 0;
}


.hd-property-kicker {
    margin-bottom: 6px;

    color: #52708d;

    font-size: 12px;
    line-height: 1.2;
    font-weight: 800;

    letter-spacing: .08em;
    text-transform: uppercase;
}


.hd-property-header h2 {
    margin: 0 0 7px;

    color: #071b2e;

    font-size: 26px;
    line-height: 1.15;
    font-weight: 750;
}


.hd-property-description {
    max-width: 720px;

    margin: 0;

    color: #607991;

    font-size: 14px;
    line-height: 1.45;
}


.hd-property-header-side {
    flex: 0 0 auto;
}


.hd-property-demo-badge {
    display: inline-flex;
    align-items: center;

    padding: 8px 13px;

    background: #f4f7fa;

    border: 1px solid #d6e0e9;
    border-radius: 8px;

    color: #60758a;

    font-size: 11px;
    font-weight: 800;

    letter-spacing: .05em;
}

/* =================================================
   HOME DEMO — PROPERTY NAVIGATION
   ================================================= */

.hd-demo-nav {
    display: flex;
    align-items: center;
    gap: 6px;

    margin-top: 14px;
    padding: 6px;

    background: #ffffff;

    border: 1px solid #dbe5ef;
    border-radius: 12px;

    box-sizing: border-box;
}


/* NAV ITEM */

.hd-demo-nav button,
.hd-demo-nav a {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-height: 40px;

    padding: 0 18px;

    border: 0;
    border-radius: 8px;

    background: transparent;

    color: #526b82;

    font-size: 13px;
    font-weight: 650;

    text-decoration: none;

    white-space: nowrap;

    cursor: default;
}


/* ACTIVE */

.hd-demo-nav .active,
.hd-demo-nav .is-active {
    background: #edf4ff;

    color: #1f5fa8;

    font-weight: 750;
}


/* HOVER — ONLY VISUAL */

.hd-demo-nav button:not(.active):hover,
.hd-demo-nav a:not(.active):hover {
    background: #f6f9fc;
    color: #315b84;
}


/* MOBILE */

@media (max-width: 800px) {

    .hd-demo-nav {
        overflow-x: auto;
        scrollbar-width: none;
    }

    .hd-demo-nav::-webkit-scrollbar {
        display: none;
    }

    .hd-demo-nav button,
    .hd-demo-nav a {
        flex: 0 0 auto;
    }
}


/* =========================================================
   HOME DEMO — LIFESTYLE AREAS
   ========================================================= */

.hd-lifestyle-section {
    margin-top: 28px;
}

.hd-section-heading {
    margin-bottom: 12px;
}

.hd-section-heading h2 {
    margin: 0;
    font-size: 24px;
    line-height: 1.2;
    font-weight: 700;
    color: #0f172a;
}

.hd-section-heading p {
    margin: 6px 0 0;
    font-size: 14px;
    line-height: 1.45;
    color: #64748b;
}

.hd-lifestyle-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: start;
    gap: 18px;
}

.hd-lifestyle-card {
    min-height: 145px;
    padding: 20px 22px 18px;

    background: #ffffff;
    border: 1px solid #dbe3ec;
    border-radius: 14px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    box-sizing: border-box;
}

.hd-lifestyle-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
}

.hd-lifestyle-name {
    font-size: 19px;
    line-height: 1.2;
    font-weight: 700;
    color: #0f172a;
}

.hd-lifestyle-location {
    margin-top: 5px;
    font-size: 13px;
    line-height: 1.3;
    color: #64748b;
}

.hd-lifestyle-exposure {
    flex-shrink: 0;

    padding: 5px 10px;
    border-radius: 7px;

    background: #f1f6f3;
    color: #426353;

    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    text-transform: lowercase;
}

.hd-lifestyle-divider {
    height: 1px;
    margin: 17px 0 14px;
    background: #edf1f5;
}

.hd-lifestyle-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.hd-lifestyle-priority {
    display: flex;
    align-items: center;
    gap: 6px;

    font-size: 12px;
}

.hd-lifestyle-priority span {
    color: #94a3b8;
}

.hd-lifestyle-priority strong {
    color: #334155;
    font-weight: 600;
}

.hd-lifestyle-details {
    padding: 0;

    border: 0;
    background: transparent;

    color: #2563eb;

    font-size: 12px;
    font-weight: 600;

    cursor: default;
}

.hd-lifestyle-details span {
    margin-left: 4px;
}


/* ---------------------------------------------------------
   SUBTLE LIFESTYLE ACCENTS
   --------------------------------------------------------- */

.hd-lifestyle-sleep {
    border-top: 3px solid #dbeafe;
}

.hd-lifestyle-work {
    border-top: 3px solid #d1fae5;
}

.hd-lifestyle-rest {
    border-top: 3px solid #e2e8f0;
}


/* ---------------------------------------------------------
   RESPONSIVE
   --------------------------------------------------------- */

@media (max-width: 900px) {

    .hd-lifestyle-grid {
        grid-template-columns: 1fr;
    }

}

/* =========================================================
   HOME DEMO — ENVIRONMENTAL SOURCES
   ========================================================= */

.hd-source-section {
    margin-top: 30px;
}

.hd-source-section .hd-section-heading {
    margin-bottom: 12px;
}

.hd-source-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
}

.hd-source-card {
    min-height: 86px;
    padding: 14px 16px;

    display: flex;
    align-items: center;
    gap: 14px;

    box-sizing: border-box;

    background: #ffffff;
    border: 1px solid #dbe3ec;
    border-radius: 13px;
}

.hd-source-icon {
    width: 46px;
    height: 46px;
    flex: 0 0 46px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 12px;

    background: #eef4fa;
    color: #456783;
}

.hd-source-icon span {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .04em;
}

.hd-source-content {
    min-width: 0;
    flex: 1;
}

.hd-source-name {
    font-size: 15px;
    line-height: 1.25;
    font-weight: 700;
    color: #172b3f;
}

.hd-source-location {
    margin-top: 4px;

    font-size: 12px;
    line-height: 1.3;
    color: #71849a;
}

.hd-source-exposure {
    flex-shrink: 0;

    padding: 5px 9px;
    border-radius: 7px;

    font-size: 11px;
    line-height: 1;
    font-weight: 600;
}

.hd-source-exposure-low {
    background: #f1f6f3;
    color: #52715f;
}

.hd-source-exposure-moderate {
    background: #f5f3e9;
    color: #756b3c;
}

.hd-source-exposure-high {
    background: #fbeeee;
    color: #a34c4c;
}


/* More separation before recommendations */

.hd-recommendations-section {
    margin-top: 30px;
}


@media (max-width: 900px) {

    .hd-source-grid {
        grid-template-columns: 1fr;
    }

}


/* =========================================================
   HOME DEMO — PERSONALISED RECOMMENDATIONS
   ========================================================= */

.hd-recommendations-section {
    margin-top: 32px;
}

.hd-recommendations-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.hd-recommendation-card {
    position: relative;

    display: flex;
    align-items: center;

    min-height: 82px;
    padding: 15px 18px 15px 16px;

    background: #ffffff;
    border: 1px solid #dbe3ec;
    border-radius: 13px;

    box-sizing: border-box;

    overflow: hidden;

    transition:
        border-color .15s ease,
        box-shadow .15s ease;
}

/* subtle priority indicator */

.hd-recommendation-card::before {
    content: "";

    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;

    width: 4px;

    background: #dbeafe;
}

.hd-recommendation-high::before {
    background: #f0b36a;
}

.hd-recommendation-medium::before {
    background: #9bbde0;
}


/* number */

.hd-recommendation-number {
    width: 36px;
    height: 36px;

    flex: 0 0 36px;

    display: flex;
    align-items: center;
    justify-content: center;

    margin-right: 16px;

    border-radius: 50%;

    background: #edf4ff;
    color: #276bc1;

    font-size: 13px;
    font-weight: 700;
}


/* content */

.hd-recommendation-content {
    min-width: 0;
    flex: 1;
}

.hd-recommendation-title {
    font-size: 15px;
    line-height: 1.35;
    font-weight: 700;

    color: #162b40;
}

.hd-recommendation-description {
    margin-top: 4px;

    font-size: 13px;
    line-height: 1.45;

    color: #687f97;
}


/* priority */

.hd-recommendation-priority {
    flex-shrink: 0;

    margin-left: 20px;

    padding: 6px 10px;

    border-radius: 7px;

    font-size: 11px;
    line-height: 1;

    font-weight: 600;
}

.hd-recommendation-priority-high {
    background: #fff4e7;
    color: #99632c;
}

.hd-recommendation-priority-medium {
    background: #eef4fa;
    color: #54708c;
}


/* hover */

.hd-recommendation-card:hover {
    border-color: #c9d8e8;
    box-shadow: 0 3px 12px rgba(20, 50, 80, .05);
}


/* mobile */

@media (max-width: 700px) {

    .hd-recommendation-card {
        align-items: flex-start;
    }

    .hd-recommendation-priority {
        margin-left: 10px;
    }

}


/* =========================================================
   HOME DEMO — PROFESSIONAL SECTION SPACING
   ========================================================= */

.hd-professional-section {
    margin-top: 28px;
    padding-top: 26px;
    padding-bottom: 30px;
}

.hd-professional-section .hd-section-heading {
    margin-bottom: 18px;
}

.hd-professional-section .hd-professional-grid {
    margin-top: 0;
}


/* ==================================================
   HOME DEMO — LIFESTYLE AREAS
   ================================================== */

.hd-lifestyle-section {
    margin-top: 34px;
}


.hd-lifestyle-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 18px;
}


.hd-lifestyle-heading h2 {
    margin: 4px 0 6px;
    font-size: 25px;
    line-height: 1.15;
    color: #10243f;
}


.hd-lifestyle-heading p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: #5f7897;
}


.hd-lifestyle-summary {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    border: 1px solid #d9e4ef;
    border-radius: 10px;
    background: #ffffff;
    color: #5f7897;
    font-size: 12px;
    line-height: 1.25;
    white-space: nowrap;
}


.hd-lifestyle-summary strong {
    font-size: 22px;
    line-height: 1;
    color: #17345a;
}


.hd-lifestyle-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
}


.hd-lifestyle-card {
    position: relative;
    min-height: 225px;
    padding: 20px 22px 18px;

    border: 1px solid #dbe5ef;
    border-radius: 14px;

    background: #ffffff;

    box-shadow:
        0 2px 8px rgba(24, 52, 82, 0.035);

    transition:
        transform 0.15s ease,
        box-shadow 0.15s ease;
}


.hd-lifestyle-card:hover {
    transform: translateY(-2px);

    box-shadow:
        0 8px 22px rgba(24, 52, 82, 0.08);
}


/* AREA ACCENTS */

.hd-lifestyle-sleep {
    border-top: 3px solid #5c9df5;
}


.hd-lifestyle-work {
    border-top: 3px solid #56b98b;
}


.hd-lifestyle-rest {
    border-top: 3px solid #9a86e8;
}


/* TOP */

.hd-lifestyle-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
}


.hd-lifestyle-icon {
    width: 44px;
    height: 44px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 12px;

    overflow: hidden;
}

.hd-lifestyle-icon img {
    width: 32px;
    height: 32px;

    object-fit: contain;
    display: block;
}


.hd-lifestyle-sleep .hd-lifestyle-icon {
    background: #edf5ff;
}


.hd-lifestyle-work .hd-lifestyle-icon {
    background: #edf9f3;
}


.hd-lifestyle-rest .hd-lifestyle-icon {
    background: #f3efff;
}


/* EXPOSURE */

.hd-exposure-badge {
    padding: 5px 9px;

    border-radius: 7px;

    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
}


.hd-exposure-low {
    background: #eef7f1;
    color: #357453;
}


.hd-exposure-moderate {
    background: #fff6e8;
    color: #9a6b20;
}


/* CONTENT */

.hd-lifestyle-card h3 {
    margin: 15px 0 3px;

    font-size: 21px;
    line-height: 1.2;

    color: #10243f;
}


.hd-lifestyle-room {
    font-size: 13px;
    font-weight: 500;
    color: #6a83a0;
}


.hd-lifestyle-description {
    margin: 14px 0 18px;

    min-height: 42px;

    font-size: 13px;
    line-height: 1.5;

    color: #607995;
}


/* FOOTER */

.hd-lifestyle-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding-top: 14px;

    border-top: 1px solid #edf1f5;
}


.hd-priority-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;

    padding: 5px 8px;

    border-radius: 7px;

    background: #f4f7fa;

    font-size: 11px;
    color: #8092a7;
}


.hd-priority-badge strong {
    color: #304a68;
}


.hd-lifestyle-link {
    border: 0;
    padding: 0;

    background: transparent;

    color: #2467d6;

    font-size: 12px;
    font-weight: 600;

    cursor: pointer;
}


.hd-lifestyle-link span {
    margin-left: 4px;
    font-size: 15px;
}


@media (max-width: 1050px) {

    .hd-lifestyle-grid {
        grid-template-columns: 1fr;
    }

    .hd-lifestyle-card {
        min-height: auto;
    }

}

/* =================================================
   HOME DEMO — LIFESTYLE PLAN MARKERS
   ================================================= */

.hd-floor-plan-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
    max-width: 100%;
}

.hd-floor-plan-wrapper .hd-floor-plan-image {
    display: block;
    width: 100%;
    height: auto;
}

.hd-lifestyle-marker {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    pointer-events: auto;
    cursor: pointer;
    z-index: 5;
}

.hd-lifestyle-marker-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.94);
    border: 2px solid #ffffff;
    box-shadow: 0 3px 10px rgba(20, 50, 90, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
}

.hd-lifestyle-marker-icon img {
    width: 24px;
    height: 24px;
    object-fit: contain;
}

.hd-lifestyle-marker span {
    padding: 2px 7px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.94);
    font-size: 10px;
    font-weight: 700;
    color: #163b63;
    box-shadow: 0 2px 6px rgba(20, 50, 90, 0.12);
    white-space: nowrap;
}

.hd-lifestyle-marker-sleep .hd-lifestyle-marker-icon {
    border-color: #5b8def;
}

.hd-lifestyle-marker-work .hd-lifestyle-marker-icon {
    border-color: #45b98a;
}

.hd-lifestyle-marker-rest .hd-lifestyle-marker-icon {
    border-color: #8c6ee8;
}

.hd-lifestyle-marker-active {
    z-index: 20;
    transform: translate(-50%, -50%) scale(1.18);
}

.hd-lifestyle-marker-active .hd-lifestyle-marker-icon {
    box-shadow:
        0 0 0 5px rgba(91, 141, 239, 0.18),
        0 0 20px rgba(91, 141, 239, 0.45);
}

.hd-lifestyle-marker-active span {
    font-size: 11px;
    box-shadow:
        0 3px 10px rgba(20, 50, 90, 0.20);
}

.hd-lifestyle-highlight {
    transform: translateY(-3px);
    background: linear-gradient(
        135deg,
        rgba(91, 141, 239, 0.08),
        rgba(91, 141, 239, 0.03)
    );

    box-shadow:
        0 0 0 2px rgba(91, 141, 239, 0.18),
        0 10px 24px rgba(20, 50, 90, 0.10);

    transition:
        background 0.25s ease,
        box-shadow 0.25s ease,
        transform 0.25s ease;
}

.hd-lifestyle-details {
    display: none;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e6edf4;
}

.hd-lifestyle-card.hd-lifestyle-expanded .hd-lifestyle-details {
    display: block;
}

.hd-lifestyle-detail-block {
    margin-bottom: 14px;
}

.hd-lifestyle-detail-block:last-child {
    margin-bottom: 0;
}

.hd-lifestyle-detail-label {
    margin-bottom: 5px;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #71839a;
}

.hd-lifestyle-detail-block p {
    margin: 0;
    font-size: 12px;
    line-height: 1.55;
    color: #53677d;
}

.hd-lifestyle-recommendation {
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(91, 141, 239, 0.055);
}

.hd-lifestyle-recommendation strong {
    display: block;
    margin-bottom: 5px;
    font-size: 12px;
    line-height: 1.4;
    color: #183b61;
}

.hd-lifestyle-actions {
    display: flex;
    align-items: center;
    gap: 14px;
}

.hd-lifestyle-recommendation-link {
    border: 0;
    background: none;
    padding: 0;
    font: inherit;
    font-size: 10px;
    font-weight: 700;
    color: #71839a;
    cursor: pointer;
}

.hd-lifestyle-recommendation-link:hover {
    color: #3f6fae;
}

.hd-lifestyle-recommendation-link span {
    margin-left: 3px;
}


/* =================================================
   HOME DEMO — ASSESSMENT METHODOLOGY
   ================================================= */

.hd-assessment-method-section {
    margin-top: 28px;
    padding: 28px;
    border: 1px solid #dce5ef;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 8px 28px rgba(20, 50, 90, 0.06);
}

.hd-assessment-method-heading {
    margin-bottom: 22px;
}

.hd-assessment-method-heading h2 {
    margin: 5px 0 7px;
    font-size: 22px;
    color: #102f50;
}

.hd-assessment-method-heading p {
    max-width: 760px;
    margin: 0;
    color: #61758b;
    font-size: 13px;
    line-height: 1.55;
}

.hd-assessment-method-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
    gap: 22px;
}


/* SPATIAL CARD */

.hd-assessment-spatial-card {
    border: 1px solid #dce5ef;
    border-radius: 14px;
    overflow: hidden;
    background: #f8fafc;
}

.hd-assessment-spatial-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;
    padding: 18px 20px;
    background: #ffffff;
    border-bottom: 1px solid #e4ebf2;
}

.hd-assessment-spatial-header h3 {
    margin: 4px 0 0;
    font-size: 16px;
    color: #173a60;
}

.hd-scale-badge {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 9px;
    border-radius: 7px;
    background: #eef8f2;
    color: #28734e;
    font-size: 10px;
    font-weight: 700;
}

.hd-scale-badge span {
    font-size: 11px;
}


/* SPATIAL VISUAL */

.hd-assessment-spatial-visual {
    position: relative;
    min-height: 285px;
    padding: 28px 30px;
    background:
        linear-gradient(
            180deg,
            #f4f8fc 0%,
            #eef3f8 100%
        );
}

.hd-spatial-floor {
    position: relative;
    height: 105px;
    border: 1px solid #cdd9e5;
    border-radius: 10px;
    background: #ffffff;
    box-shadow: 0 4px 14px rgba(20, 50, 90, 0.06);
}

.hd-spatial-floor-top {
    margin-right: 48px;
}

.hd-spatial-floor-bottom {
    margin-left: 48px;
    margin-top: 22px;
}

.hd-spatial-floor-label {
    position: absolute;
    top: 9px;
    left: 12px;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: #8192a5;
}

.hd-spatial-zone {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 700;
}

.hd-spatial-zone img {
    width: 24px;
    height: 24px;
    object-fit: contain;
}

.hd-spatial-sleep {
    left: 34%;
    top: 42%;
    background: #eef4ff;
    border: 1px solid #cbdcff;
}

.hd-spatial-work {
    left: 48%;
    top: 38%;
    background: #edf9f4;
    border: 1px solid #cce9dc;
}

.hd-spatial-source {
    position: absolute;
    right: 15%;
    top: 46%;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
    font-weight: 700;
    color: #63788e;
}

.hd-spatial-source-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #5b8def;
    box-shadow: 0 0 0 5px rgba(91, 141, 239, 0.12);
}

.hd-spatial-z-axis {
    position: absolute;
    left: 50%;
    top: 119px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
    z-index: 2;
}

.hd-spatial-z-line {
    width: 1px;
    height: 35px;
    background: #8da2b7;
}

.hd-spatial-z-axis span {
    font-size: 9px;
    font-weight: 800;
    color: #536a80;
}

.hd-spatial-z-axis small {
    font-size: 8px;
    color: #8b9caf;
}

.hd-spatial-distance {
    position: absolute;
    right: 14px;
    bottom: 12px;
    display: flex;
    flex-direction: column;
    text-align: right;
}

.hd-spatial-distance strong {
    font-size: 9px;
    color: #365875;
}

.hd-spatial-distance span {
    font-size: 8px;
    color: #8495a7;
}

.hd-spatial-coordinate-label {
    position: absolute;
    right: 18px;
    bottom: 8px;
    font-size: 8px;
    color: #9aa8b7;
}


/* SPATIAL NOTE */

.hd-assessment-spatial-note {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 15px 20px;
    background: #ffffff;
    border-top: 1px solid #e4ebf2;
}

.hd-assessment-spatial-note strong {
    font-size: 11px;
    color: #244967;
}

.hd-assessment-spatial-note span {
    font-size: 10px;
    line-height: 1.45;
    color: #71849a;
}


/* PRINCIPLES */

.hd-assessment-principles {
    display: flex;
    flex-direction: column;
    gap: 9px;
}

.hd-assessment-principle {
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: 11px;
    padding: 13px 14px;
    border: 1px solid #e0e8f0;
    border-radius: 10px;
    background: #ffffff;
}

.hd-assessment-principle-number {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f5fa;
    color: #57728c;
    font-size: 9px;
    font-weight: 800;
}

.hd-assessment-principle h3 {
    margin: 1px 0 4px;
    font-size: 12px;
    color: #193d60;
}

.hd-assessment-principle p {
    margin: 0;
    font-size: 10px;
    line-height: 1.45;
    color: #6c8095;
}


/* LOGIC FLOW */

.hd-assessment-flow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 22px;
    padding: 17px 14px;
    border-radius: 11px;
    background: #f5f8fb;
    border: 1px solid #e1e8ef;
}

.hd-assessment-flow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 105px;
    text-align: center;
}

.hd-assessment-flow-step span {
    font-size: 8px;
    font-weight: 800;
    color: #8799aa;
}

.hd-assessment-flow-step strong {
    margin-top: 2px;
    font-size: 10px;
    color: #254b6b;
}

.hd-assessment-flow-step small {
    margin-top: 2px;
    font-size: 8px;
    color: #8192a4;
}

.hd-assessment-flow-arrow {
    color: #9aabba;
    font-size: 14px;
}


/* TRUST NOTE */

.hd-assessment-trust-note {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 16px;
    text-align: center;
    font-size: 10px;
    color: #708397;
}

.hd-assessment-trust-note strong {
    color: #365a77;
}


/* RESPONSIVE */

@media (max-width: 900px) {

    .hd-assessment-method-layout {
        grid-template-columns: 1fr;
    }

    .hd-assessment-flow {
        flex-wrap: wrap;
    }

}

@media (max-width: 600px) {

    .hd-assessment-method-section {
        padding: 18px;
    }

    .hd-assessment-spatial-header {
        flex-direction: column;
    }

    .hd-assessment-flow-arrow {
        display: none;
    }

    .hd-assessment-flow-step {
        min-width: 80px;
    }

}

/* =================================================
   HOME DEMO — ENVIRONMENTAL SOURCES
   ================================================= */

.hd-sources-section {
    margin-top: 30px;
}

.hd-sources-section > .hd-section-heading {
    margin-bottom: 18px;
}

.hd-sources-section .hd-section-heading h2 {
    margin: 5px 0 6px;
    font-size: 21px;
    color: #102f50;
}

.hd-sources-section .hd-section-heading p {
    max-width: 760px;
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: #667b91;
}


/* =================================================
   ENVIRONMENTAL SOURCE — EVIDENCE CARDS
   ================================================= */

.hd-source-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    width: 100%;
}

.hd-source-card {
    min-width: 0;
    overflow: hidden;
    box-sizing: border-box;

    border: 1px solid #dce5ef;
    border-radius: 13px;
    background: #ffffff;

    box-shadow:
        0 5px 16px rgba(20, 50, 90, 0.045);
}

.hd-source-card * {
    box-sizing: border-box;
}


/* ================================================
   HEADER
   ================================================ */

.hd-source-card-header {
    display: flex;
    align-items: center;
    gap: 11px;

    padding: 16px 17px;

    border-bottom: 1px solid #e8eef4;
}

.hd-source-icon {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 9px;
    background: #eef4fa;
    color: #477096;
}

.hd-source-icon span {
    font-size: 8px;
    font-weight: 800;
}

.hd-source-title-group {
    min-width: 0;
    flex: 1;
}

.hd-source-title-group h3 {
    margin: 0;

    font-size: 14px;
    line-height: 1.2;
    color: #173b5e;

    overflow-wrap: anywhere;
}

.hd-source-type {
    display: block;
    margin-top: 4px;

    font-size: 8px;
    line-height: 1.25;
    color: #8495a7;
}

.hd-source-exposure {
    flex-shrink: 0;

    padding: 4px 7px;
    border-radius: 6px;

    font-size: 8px;
    font-weight: 700;
    text-transform: capitalize;
}

.hd-source-exposure-low {
    background: #eef8f2;
    color: #2e7753;
}

.hd-source-exposure-moderate {
    background: #fff5e6;
    color: #a26a18;
}


/* ================================================
   EVIDENCE
   ================================================ */

.hd-source-evidence-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;

    border-bottom: 1px solid #e8eef4;
}

.hd-source-evidence-item {
    min-width: 0;
    min-height: 66px;

    padding: 11px 13px;

    background: #ffffff;
}

.hd-source-evidence-item:nth-child(odd) {
    border-right: 1px solid #e8eef4;
}

.hd-source-evidence-item:nth-child(-n + 2) {
    border-bottom: 1px solid #e8eef4;
}

.hd-source-evidence-label {
    display: block;
    margin-bottom: 5px;

    font-size: 7px;
    line-height: 1.2;
    font-weight: 800;
    letter-spacing: 0.1em;

    color: #8293a5;
}

.hd-source-evidence-item strong {
    display: block;

    font-size: 10px;
    line-height: 1.35;

    color: #365873;

    overflow-wrap: anywhere;
}


/* ================================================
   FOOTER
   ================================================ */

.hd-source-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    min-height: 48px;
    padding: 11px 13px;

    background: #f8fafc;
}

.hd-source-integrity {
    min-width: 0;
    max-width: 58%;

    font-size: 8px;
    line-height: 1.35;

    color: #8a9aab;
}

.hd-source-view-link {
    flex-shrink: 0;

    border: 0;
    background: transparent;
    padding: 0;

    font-size: 9px;
    font-weight: 700;

    color: #3974c4;

    cursor: pointer;
    white-space: nowrap;
}

.hd-source-view-link:hover {
    color: #245d9e;
}

.hd-source-view-link span {
    margin-left: 3px;
}


/* ================================================
   TRUST NOTE
   ================================================ */

.hd-sources-trust-note {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 6px;

    margin-top: 13px;
    padding: 12px 15px;

    border: 1px solid #e1e8ef;
    border-radius: 9px;

    background: #f6f9fc;

    text-align: center;

    font-size: 9px;
    line-height: 1.4;
    color: #718397;
}

.hd-sources-trust-note strong {
    color: #365a77;
}


/* ================================================
   RESPONSIVE
   ================================================ */

@media (max-width: 900px) {

    .hd-source-grid {
        grid-template-columns: 1fr;
    }

}

/* =================================================
   ENVIRONMENTAL SOURCES — FINAL LAYOUT OVERRIDE
   ================================================= */

.hd-source-grid {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 16px !important;
    width: 100% !important;
}

.hd-source-card {
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
}

.hd-source-card-header {
    display: flex !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

.hd-source-evidence-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

.hd-source-evidence-item {
    min-width: 0 !important;
    width: auto !important;
    box-sizing: border-box !important;
}

.hd-source-card-footer {
    display: flex !important;
    width: 100% !important;
    box-sizing: border-box !important;
}


/* =================================================
   HOME DEMO — 3D HOUSE SPATIAL MODEL
   ================================================= */

.hd-assessment-house-visual {
    padding: 0 !important;
    background: #f4f7fa !important;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.hd-assessment-house-image {
    display: block;
    width: 100%;
    height: auto;
    max-height: 470px;
    object-fit: contain;
}


/* =================================================
   HOME DEMO — SOURCE PLAN MARKERS
   ================================================= */

.hd-source-marker {
    position: absolute;
    z-index: 8;

    transform: translate(-50%, -50%);

    display: flex;
    flex-direction: column;
    align-items: center;

    cursor: pointer;

    transition:
        transform 0.2s ease,
        filter 0.2s ease;
}

.hd-source-marker:hover {
    transform: translate(-50%, -50%) scale(1.06);
    filter: brightness(1.03);
}

.hd-source-marker-icon {
    width: 42px;
    height: 42px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 2px solid #3974c4;
    border-radius: 10px;

    background: rgba(255, 255, 255, 0.96);

    box-shadow:
        0 3px 10px rgba(20, 50, 90, 0.16);
}

.hd-source-marker-icon img {
    width: 29px;
    height: 29px;

    object-fit: contain;
}

.hd-source-marker span {
    margin-top: 4px;
    padding: 3px 7px;

    border-radius: 6px;

    background: rgba(255, 255, 255, 0.96);

    font-size: 9px;
    line-height: 1.1;
    font-weight: 700;

    color: #173b5e;

    white-space: nowrap;

    box-shadow:
        0 2px 6px rgba(20, 50, 90, 0.10);
}


/* Outdoor infrastructure */

.hd-source-marker-mobile .hd-source-marker-icon {
    border-color: #8c42c5;
}

.hd-source-marker-power .hd-source-marker-icon {
    border-color: #f28a16;
}


/* Active / highlighted source */

.hd-source-marker.hd-source-marker-active {
    z-index: 20;
}

.hd-source-marker.hd-source-marker-active
.hd-source-marker-icon {
    transform: scale(1.12);

    box-shadow:
        0 0 0 5px rgba(57, 116, 196, 0.14),
        0 5px 18px rgba(20, 50, 90, 0.22);
}


/* =================================================
   SOURCE CARD — ACTIVE HIGHLIGHT
   ================================================= */

.hd-source-card.hd-source-card-active {
    border-color: #3974c4;

    box-shadow:
        0 0 0 3px rgba(57, 116, 196, 0.10),
        0 8px 24px rgba(20, 50, 90, 0.10);

    transform: translateY(-2px);

    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.2s ease;
}



.hd-source-type {
    white-space: nowrap !important;
    font-size: 8px !important;
    letter-spacing: -0.2px;
    line-height: 1 !important;
    transform: scale(0.9);
}


.hd-spatial-example-card {
    margin-top: 12px;
    padding: 12px;
    background: #ffffff;
    border: 1px solid #dce5ef;
    border-radius: 12px;
    overflow: hidden;
}

.hd-spatial-example-label {
    margin: 0 0 8px 2px;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #3974c4;
}

.hd-spatial-example-image {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 8px;
}

.hd-assessment-spatial-card {
    height: auto !important;
    min-height: 0 !important;
    align-self: start !important;
}


body.business-demo-active #homeDemoWorkspace {
    display: none !important;
}

@media (max-width: 1050px) {

    .hd-professional-grid {
        grid-template-columns: 1fr;
    }

    .hd-professional-visual {
        height: 170px;
        margin-bottom: 18px;
    }

}


        `;

        document.head.appendChild(style);
    }


    /* =====================================================
       RENDER
       ===================================================== */

    function renderHomeDemo(
        project,
        analysis
    ) {

        console.log(
            "🏠 renderHomeDemo CALLED",
            {
                businessDemo: window.EMFBusinessDemo,
                homeDemo: window.EMFHomeDemo,
                experience: window.EMFWorkspaceExperience,
                bodyClasses: document.body.className
            }
        );

        const root =
            getHomeDemoRoot();

        if (!root) {
            return;
        }

        injectStyles();

        document.body.classList.add(
            "home-demo-active"
        );

        const lifestyleAreas =
            analysis?.lifestyleAreas ||
            project?.lifestyleAreas ||
            [];

        const sources =
            analysis?.sources ||
            project?.sources ||
            [];

        const recommendations =
            analysis?.recommendations ||
            project?.recommendations ||
            [];

        const insights =
            analysis?.insights ||
            project?.insights ||
            {};

        const floors =
            project?.floors ||
            [];

        const lifestyleCount =
            lifestyleAreas.length;

        const sourceCount =
            sources.length;

        const recommendationCount =
            recommendations.length;

        const floorCount =
            floors.length;

        const floorLabel =
            floorCount === 1
                ? "1 Floor"
                : `${floorCount} Floors`;

        root.innerHTML = `

            <div class="hd-demo-shell">

                <!-- =================================================
                     DEMO BANNER
                     ================================================= -->

                <section class="hd-demo-banner">

                    <div class="hd-demo-banner-left">

                        <div class="hd-demo-kicker">
                            HOME WELLNESS · PROFESSIONAL PREVIEW
                        </div>

                        <h1 class="hd-demo-title">
                            Explore the Property Health Experience
                        </h1>

                        <div class="hd-demo-subtitle">
                            See how Property Health Records help people understand their
environment, discover sources and make informed improvements.
                        </div>

                        <div class="hd-demo-readonly">
                            🔒 Read-only demo
                        </div>

                    </div>

                    <div class="hd-demo-banner-action">

    <button
    class="hd-professional-cta hd-professional-cta-blue"
    type="button"
    data-home-demo-action="create-home-property"
>
    Create Your Personal Property Health Record
    <span>→</span>
</button>

</div>

                </section>


                <!-- =================================================
                     PROPERTY HEADER
                     ================================================= -->

               <div class="hd-property-header">

    <div class="hd-property-header-main">

        <div class="hd-property-kicker">
            PROPERTY HEALTH RECORD
        </div>

        <h2>Example Apartment</h2>

        <p class="hd-property-description">
            A personal record of the property's environment, lifestyle areas,
            identified sources and recommendations.
        </p>

    </div>

    <div class="hd-property-header-side">

        <div class="hd-property-demo-badge">
            DEMO PROPERTY
        </div>

    </div>

</div>


                <!-- =================================================
                     DEMO NAVIGATION
                     ================================================= -->

                <nav class="hd-demo-nav">

                    <div class="hd-demo-nav-item active">
                        Overview
                    </div>

                    <div class="hd-demo-nav-item">
                        Floor Plan
                    </div>

                    <div class="hd-demo-nav-item">
                        Lifestyle Areas
                    </div>

                    <div class="hd-demo-nav-item">
                        Sources
                    </div>

                    <div class="hd-demo-nav-item">
                        Recommendations
                    </div>

                </nav>


                <!-- =================================================
                     OVERVIEW
                     ================================================= -->

                <section class="hd-overview-grid">


                    <!-- PROPERTY MAP -->

                    <div class="hd-map-card">

                        <div class="hd-card-kicker">
                            PROPERTY HEALTH RECORD
                        </div>

                        <h3 class="hd-card-title">
                            Property Overview
                        </h3>

                        <div class="hd-map-area hd-floor-plan-area">

    <div class="hd-floor-plan-wrapper">

        <img
            src="assets/demo/home/property_floor_plan_no_indoor_sources.png"
            alt="Example property floor plan"
            class="hd-floor-plan-image"
        >

        <!-- SLEEP -->
        <div
            class="hd-lifestyle-marker hd-lifestyle-marker-sleep"
    data-lifestyle-marker="sleep"
            style="left: 37%; top: 67%;"
        >
            <div class="hd-lifestyle-marker-icon">
                <img
                    src="assets/icons/bed.png"
                    alt="Sleep"
                >
            </div>

            <span>Sleep</span>
        </div>


        <!-- WORK -->
        <div
            class="hd-lifestyle-marker hd-lifestyle-marker-work"
    data-lifestyle-marker="work"
            style="left: 47%; top: 54%;"
        >
            <div class="hd-lifestyle-marker-icon">
                <img
                    src="assets/icons/work.png"
                    alt="Work"
                >
            </div>

            <span>Work</span>
        </div>


        <!-- REST -->
        <div
            class="hd-lifestyle-marker hd-lifestyle-marker-rest"
    data-lifestyle-marker="rest"
            style="left: 47%; top: 31%;"
        >
            <div class="hd-lifestyle-marker-icon">
                <img
                    src="assets/icons/sofa.png"
                    alt="Rest"
                >
            </div>

            <span>Rest</span>
        </div>

                <!-- =================================================
             ENVIRONMENTAL SOURCES
             ================================================= -->

        <!-- WI-FI ROUTER -->
        <div
            class="hd-source-marker hd-source-marker-wifi"
            data-source-marker="demo-source-router"
            style="left: 58%; top: 55%;"
        >
            <div class="hd-source-marker-icon">
                <img
                    src="assets/demo/home/router_wifi.png"
                    alt="Wi-Fi Router"
                >
            </div>

            <span>Wi-Fi Router</span>
        </div>


        <!-- MOBILE TOWER -->
        <div
            class="hd-source-marker hd-source-marker-mobile"
            data-source-marker="demo-source-mobile-tower"
            style="left: 14%; top: 48%;"
        >
            <div class="hd-source-marker-icon">
                <img
                    src="assets/demo/home/mobile_tower.png"
                    alt="Mobile Tower"
                >
            </div>

            <span>Mobile Tower</span>
        </div>


        <!-- POWER GRID -->
        <div
            class="hd-source-marker hd-source-marker-power"
            data-source-marker="demo-source-power-grid"
            style="left: 87%; top: 48%;"
        >
            <div class="hd-source-marker-icon">
                <img
                    src="assets/demo/home/power_lines.png"
                    alt="Power Grid"
                >
            </div>

            <span>Power Grid</span>
        </div>

    </div>

</div>

                    </div>


                    <!-- ENVIRONMENT -->

                    <div class="hd-environment-card">

                        <div class="hd-card-kicker">
                            ENVIRONMENT OVERVIEW
                        </div>

                        <h3 class="hd-card-title">
                            Your Environment
                        </h3>

                        <div class="hd-environment-status">

                            <div class="hd-environment-status-label">
                                Overall profile
                            </div>

                            <div class="hd-environment-status-value">
                                ${esc(
            insights.overall ||
            "Low to moderate"
        )}
                            </div>

                            <div class="hd-environment-status-text">
                                A general overview of the property's
                                current environment.
                            </div>

                        </div>

                        <div class="hd-kpi-grid">

                            <div class="hd-kpi">
                                <div class="hd-kpi-value">
                                    ${lifestyleCount}
                                </div>

                                <div class="hd-kpi-label">
                                    Lifestyle Areas
                                </div>
                            </div>

                            <div class="hd-kpi">
                                <div class="hd-kpi-value">
                                    ${sourceCount}
                                </div>

                                <div class="hd-kpi-label">
                                    EMF Sources
                                </div>
                            </div>

                            <div class="hd-kpi">
                                <div class="hd-kpi-value">
                                    ${recommendationCount}
                                </div>

                                <div class="hd-kpi-label">
                                    Recommendations
                                </div>
                            </div>

                            <div class="hd-kpi">
                                <div class="hd-kpi-value">
                                    ${floorCount}
                                </div>

                                <div class="hd-kpi-label">
                                    Floors
                                </div>
                            </div>

                        </div>

                    </div>

                </section>

                <!-- =================================================
     HOW PHI UNDERSTANDS YOUR ENVIRONMENT
     ================================================= -->

<section class="hd-assessment-method-section">

    <div class="hd-section-heading hd-assessment-method-heading">

        <div class="hd-card-kicker">
            PHI HOME ASSESSMENT
        </div>

        <h2>
            How EMF Insight Understands Your Environment
        </h2>

        <p>
            EMF Insight uses your floor plan, spatial context and environmental
            sources to build a contextual Property Assessment.
        </p>

    </div>


    <div class="hd-assessment-method-layout">


        <!-- =========================================
             SPATIAL MODEL VISUAL
             ========================================= -->

        <div class="hd-assessment-spatial-card">

            <div class="hd-assessment-spatial-header">

                <div>
                    <div class="hd-card-kicker">
                        SPATIAL MODEL
                    </div>

                    <h3>
                        From Floor Plan to Real-World Distance
                    </h3>
                </div>

                <div class="hd-scale-badge">
                    <span>✓</span>
                    Calibrated Scale
                </div>

            </div>


            <div class="hd-assessment-spatial-visual hd-assessment-house-visual">

    <img
        src="assets/demo/home/house_spatial.png"
        alt="3D spatial relationship between indoor and outdoor environmental sources"
        class="hd-assessment-house-image"
    >

</div>


<div class="hd-assessment-spatial-note">

    <strong>
        Set the scale. PHI calculates the spatial relationship.
    </strong>

    <span>
        Indoor source distances can be calculated from the
        calibrated floor-plan geometry instead of being entered
        manually.
    </span>

</div>

        </div>


        <!-- =========================================
             METHOD PRINCIPLES
             ========================================= -->

        <div class="hd-assessment-principles">

            <article class="hd-assessment-principle">

                <div class="hd-assessment-principle-number">
                    01
                </div>

                <div>

                    <h3>
                        Calibrated Floor Plan
                    </h3>

                    <p>
                        You provide the floor-plan scale so PHI can connect
                        the uploaded plan to real-world dimensions.
                    </p>

                </div>

            </article>


            <article class="hd-assessment-principle">

                <div class="hd-assessment-principle-number">
                    02
                </div>

                <div>

                    <h3>
                        Realistic Indoor Distances
                    </h3>

                    <p>
                        Once the plan is calibrated, PHI can calculate
                        realistic spatial relationships between indoor
                        sources and relevant areas.
                    </p>

                </div>

            </article>


            <article class="hd-assessment-principle">

                <div class="hd-assessment-principle-number">
                    03
                </div>

                <div>

                    <h3>
                        Spatial &amp; 3D Context
                    </h3>

                    <p>
                        Where spatial data supports it, PHI uses X, Y and Z
                        relationships to understand cross-floor context.
                    </p>

                </div>

            </article>


            <article class="hd-assessment-principle">

                <div class="hd-assessment-principle-number">
                    04
                </div>

                <div>

                    <h3>
                        Evidence &amp; Confidence
                    </h3>

                    <p>
                        PHI distinguishes calculated spatial information
                        from approximate or unavailable location evidence.
                    </p>

                </div>

            </article>


            <article class="hd-assessment-principle">

                <div class="hd-assessment-principle-number">
                    05
                </div>

                <div>

                    <h3>
                        Risk Is More Than Distance
                    </h3>

                    <p>
                        Distance is one part of the assessment. PHI also
                        considers source characteristics, spatial context,
                        lifestyle relevance and evidence quality.
                    </p>

                </div>

                

            </article>

            <div class="hd-spatial-example-card">
    <div class="hd-spatial-example-label">
        SPATIAL CALCULATION EXAMPLE
    </div>

    <img
        src="assets/demo/home/3d_distance.png"
        alt="3D Distance Calculation example"
        class="hd-spatial-example-image"
    >
</div>

        </div>

    </div>


    <!-- =========================================
         ASSESSMENT LOGIC
         ========================================= -->

    <div class="hd-assessment-flow">

        <div class="hd-assessment-flow-step">
            <span>01</span>
            <strong>Source</strong>
            <small>Type · State</small>
        </div>

        <div class="hd-assessment-flow-arrow">→</div>

        <div class="hd-assessment-flow-step">
            <span>02</span>
            <strong>Spatial Context</strong>
            <small>Location · Distance</small>
        </div>

        <div class="hd-assessment-flow-arrow">→</div>

        <div class="hd-assessment-flow-step">
            <span>03</span>
            <strong>Lifestyle Area</strong>
            <small>Human relevance</small>
        </div>

        <div class="hd-assessment-flow-arrow">→</div>

        <div class="hd-assessment-flow-step">
            <span>04</span>
            <strong>Potential Risk</strong>
            <small>Context + evidence</small>
        </div>

        <div class="hd-assessment-flow-arrow">→</div>

        <div class="hd-assessment-flow-step">
            <span>05</span>
            <strong>Priority</strong>
            <small>Action</small>
        </div>

    </div>


    <div class="hd-assessment-trust-note">

        <strong>
            Home Assessment creates awareness and context.
        </strong>

        <span>
            When actual exposure needs to be validated, a Professional
            Assessment provides professional measurement evidence.
        </span>

    </div>

</section>


                <!-- =================================================
                     LIFESTYLE AREAS
                     ================================================= -->

               <section class="hd-lifestyle-section" id="homeDemoLifestyleAreas">

    <div class="hd-lifestyle-heading">

        <div>
            <div class="hd-card-kicker">
                LIFESTYLE AREAS
            </div>

            <h2>
                Your Lifestyle Areas
            </h2>

            <p>
                Focus on the places that matter most to your everyday life.
            </p>
        </div>

        <div class="hd-lifestyle-summary">
            <strong>${lifestyleAreas.length}</strong>
            <span>areas in your<br>Property Health Record</span>
        </div>

    </div>


    <div class="hd-lifestyle-grid">

        ${lifestyleAreas.map(area => {

            const areaClass =
                area.id === "sleep"
                    ? "sleep"
                    : area.id === "work"
                        ? "work"
                        : "rest";

            const areaIcon =
                area.id === "sleep"
                    ? "assets/icons/bed.png"
                    : area.id === "work"
                        ? "assets/icons/work.png"
                        : "assets/icons/sofa.png";

            const areaDescription =
                area.id === "sleep"
                    ? "Your sleep environment is one of the most important areas to review."
                    : area.id === "work"
                        ? "Understand the environment around your everyday work."
                        : "Review the environment in the spaces where you relax.";

            return `
                <article
    class="hd-lifestyle-card hd-lifestyle-${areaClass}"
    data-lifestyle-card="${area.id}"
>
                    <div class="hd-lifestyle-card-top">

                        <div class="hd-lifestyle-icon">
                            <img src="${areaIcon}" alt="${area.name} Icon" />
                        </div>

                        <span class="hd-exposure-badge hd-exposure-${area.exposure}">
                            ${area.exposure}
                        </span>

                    </div>


                    <h3>
                        ${area.name}
                    </h3>

                    <div class="hd-lifestyle-room">
                        ${area.room}
                    </div>

                    <p class="hd-lifestyle-description">
                        ${areaDescription}
                    </p>

                    <div class="hd-lifestyle-details">

    <div class="hd-lifestyle-detail-block">

        <div class="hd-lifestyle-detail-label">
            AREA INSIGHT
        </div>

        <p>
            ${area.id === "sleep"
                    ? "Your bedroom currently shows a low exposure profile. Sleep is one of the areas where people typically spend extended periods of time."
                    : area.id === "work"
                        ? "Your work area shows a moderate exposure profile. This is a space where device placement and distance can make a practical difference."
                        : "Your living area currently shows a low exposure profile. Maintaining practical distance from active wireless sources can help keep exposure lower."
                }
        </p>

    </div>


    <div class="hd-lifestyle-detail-block hd-lifestyle-recommendation">

        <div class="hd-lifestyle-detail-label">
            RECOMMENDATION
        </div>

        <strong>
            ${area.id === "sleep"
                    ? "Reduce wireless exposure near the sleeping area."
                    : area.id === "work"
                        ? "Review wireless devices in the work area."
                        : "Maintain distance from active wireless sources."
                }
        </strong>

        <p>
            ${area.id === "sleep"
                    ? "Keep wireless sources away from the bed where practical."
                    : area.id === "work"
                        ? "Consider distance and placement of wireless devices around the workspace."
                        : "Use practical distance and placement strategies in frequently used areas."
                }
        </p>

    </div>

</div>


                    <div class="hd-lifestyle-card-footer">

    <span class="hd-priority-badge">
        Priority
        <strong>${area.priority}</strong>
    </span>

    <div class="hd-lifestyle-actions">

        <button
            type="button"
            class="hd-lifestyle-recommendation-link"
            data-lifestyle-recommendation="${area.id}"
        >
            See Recommendation
            <span>→</span>
        </button>

        <button
            type="button"
            class="hd-lifestyle-link"
            data-lifestyle-area="${area.id}"
        >
            View ${area.name} Area
            <span>→</span>
        </button>

    </div>

</div>

                </article>
            `;

        }).join("")}

    </div>

</section>

                <!-- =================================================
     SOURCES
     ================================================= -->

<!-- =================================================
     ENVIRONMENTAL SOURCES
     ================================================= -->

<section class="hd-sources-section">

    <div class="hd-section-heading">

        <div class="hd-card-kicker">
            SPATIAL EVIDENCE
        </div>

        <h2>
            Environmental Sources
        </h2>

        <p>
            PHI evaluates sources in the context of where they are located
            and how they relate to the spaces people use.
        </p>

    </div>


    <div class="hd-source-grid">

        ${sources.map(source => {

            const sourceArea =
                source.location === "Home Office"
                    ? "Work Area"
                    : source.location === "Living Room"
                        ? "Rest Area"
                        : "Property";

            const sourceContext =
                source.location === "Home Office"
                    ? "Relevant to your Work Area"
                    : source.location === "Living Room"
                        ? "Relevant to your Rest Area"
                        : "Property-level context";

            return `

                <article
                    class="hd-source-card hd-source-card-${esc(source.level)}"
                    data-source-id="${esc(source.id)}"
                >

                    <div class="hd-source-card-header">

                        <div class="hd-source-icon">
                            <span>
                                ${esc(source.category || "RF")}
                            </span>
                        </div>

                        <div class="hd-source-title-group">

                            <h3>
                                ${esc(source.name)}
                            </h3>

                            <span class="hd-source-type">
                                ${source.environment === "OUTDOOR"
                    ? "Outdoor Infrastructure Source"
                    : "Indoor Environmental Source"}
                            </span>

                        </div>

                        <span class="
                            hd-source-exposure
                            hd-source-exposure-${esc(source.level)}
                        ">
                            ${esc(source.level)}
                        </span>

                    </div>


                    <div class="hd-source-evidence-grid">

                        <div class="hd-source-evidence-item">

                            <span class="hd-source-evidence-label">
                                LOCATION
                            </span>

                            <strong>
                                ${esc(source.location)}
                            </strong>

                        </div>


                        <div class="hd-source-evidence-item">

                            <span class="hd-source-evidence-label">
                                LIFESTYLE CONTEXT
                            </span>

                            <strong>
                                ${esc(sourceArea)}
                            </strong>

                        </div>


                        <div class="hd-source-evidence-item">

                            <span class="hd-source-evidence-label">
                                SPATIAL BASIS
                            </span>

                            <strong>
                                Floor-plan placement
                            </strong>

                        </div>


                        <div class="hd-source-evidence-item">

                            <span class="hd-source-evidence-label">
                                CONTEXT
                            </span>

                            <strong>
                                ${esc(sourceContext)}
                            </strong>

                        </div>

                    </div>


                    <div class="hd-source-card-footer">

                        <span class="hd-source-integrity">
                            Spatial relationship used as contextual evidence
                        </span>

                        <button
                            type="button"
                            class="hd-source-view-link"
                            data-source-id="${esc(source.id)}"
                        >
                            View on Property
                            <span>→</span>
                        </button>

                    </div>

                </article>

            `;

        }).join("")}

    </div>


    <div class="hd-sources-trust-note">

        <strong>
            A source is evidence — not a risk result.
        </strong>

        <span>
            PHI considers source characteristics, spatial relationships,
            Lifestyle context and evidence quality when interpreting
            potential concern.
        </span>

    </div>

</section>

<!-- ==================================================
     FOR EMF PROFESSIONALS
     ================================================== -->

<section class="hd-professional-section">

    <div class="hd-section-heading">
        <div class="hd-eyebrow">FOR EMF PROFESSIONALS</div>

        <h2>
            Grow your professional practice with EMF Insight
        </h2>

        <p>
            Use the platform for your own work, connect with Home users,
            and become discoverable in the areas you serve.
        </p>
    </div>


    <div class="hd-professional-grid">

    <!-- ==================================================
         01 — USE THE PLATFORM
         ================================================== -->

    <div class="hd-professional-card hd-professional-card-blue">

        <div class="hd-professional-hero">

            <div class="hd-professional-hero-copy">

                <div class="hd-professional-number">
                    01
                </div>

                <h3>
                    Use the Platform
                </h3>

                <p>
                    Run professional surveys, measurements, analysis
                    and reports in one platform.
                </p>

            </div>

            <div class="hd-professional-hero-image">
                <img
                    src="assets/demo/benefits/use_platform.png"
                    alt="Use the EMF Insight platform"
                >
            </div>

        </div>


        <div class="hd-professional-flow">

    <div class="hd-flow-step">
        <div class="hd-flow-icon hd-flow-icon-blue">
            <img
                src="assets/demo/benefits/professional_survey.png"
                alt="Professional Survey"
            >
        </div>
        <span>Professional<br>Survey</span>
    </div>

    <div class="hd-flow-arrow">
        →
    </div>

    <div class="hd-flow-step">
        <div class="hd-flow-icon hd-flow-icon-blue">
            <img
                src="assets/demo/benefits/measurements.png"
                alt="Measurements"
            >
        </div>
        <span>Measurements</span>
    </div>

    <div class="hd-flow-arrow">
        →
    </div>

    <div class="hd-flow-step">
        <div class="hd-flow-icon hd-flow-icon-blue">
            <img
                src="assets/demo/benefits/analysis.png"
                alt="Analysis"
            >
        </div>
        <span>Analysis</span>
    </div>

    <div class="hd-flow-arrow">
        →
    </div>

    <div class="hd-flow-step">
        <div class="hd-flow-icon hd-flow-icon-blue">
            <img
                src="assets/demo/benefits/report.png"
                alt="Report"
            >
        </div>
        <span>Report</span>
    </div>

</div>

<button
    class="hd-professional-cta hd-professional-cta-blue"
    type="button"
    data-home-demo-action="open-business-demo"
>
    Explore Professional Survey
    <span>→</span>
</button>

    </div>


    <!-- ==================================================
         02 — GET CLIENTS
         ================================================== -->

    <div class="hd-professional-card hd-professional-card-green">

        <div class="hd-professional-hero">

            <div class="hd-professional-hero-copy">

                <div class="hd-professional-number">
                    02
                </div>

                <h3>
                    Get Clients
                </h3>

                <p>
                    Receive relevant Home assessment requests
                    and connect with potential clients.
                </p>

            </div>

            <div class="hd-professional-hero-image">
                <img
                    src="assets/demo/benefits/get_clients.png"
                    alt="Get clients through EMF Insight"
                >
            </div>

        </div>


        <div class="hd-professional-flow">

    <div class="hd-flow-step">
        <div class="hd-flow-icon hd-flow-icon-green">
            <img
                src="assets/demo/benefits/home_requests.png"
                alt="Home Requests"
            >
        </div>
        <span>Home<br>Requests</span>
    </div>

    <div class="hd-flow-arrow hd-flow-arrow-green">
        →
    </div>

    <div class="hd-flow-step">
       <div class="hd-flow-icon hd-flow-icon-green hd-flow-icon-match">
    <img
        src="assets/demo/benefits/professional_matching.png"
        alt="Professional Matching"
    >
</div>
        <span>Professional<br>Matching</span>
    </div>

    <div class="hd-flow-arrow hd-flow-arrow-green">
        →
    </div>

    <div class="hd-flow-step">
        <div class="hd-flow-icon hd-flow-icon-green">
            <img
                src="assets/demo/benefits/contact.png"
                alt="Contact"
            >
        </div>
        <span>Contact</span>
    </div>

    <div class="hd-flow-arrow hd-flow-arrow-green">
        →
    </div>

    <div class="hd-flow-step">
        <div class="hd-flow-icon hd-flow-icon-green">
            <img
                src="assets/demo/benefits/client.png"
                alt="Client"
            >
        </div>
        <span>Client</span>
    </div>

</div>


        <button
    class="hd-professional-cta hd-professional-cta-green"
    type="button"
    data-home-demo-action="view-home-requests"
>
    View Early Home Requests
    <span>→</span>
</button>

    </div>


    <!-- ==================================================
         03 — GET DISCOVERED
         ================================================== -->

    <div class="hd-professional-card hd-professional-card-purple">

        <div class="hd-professional-hero">

            <div class="hd-professional-hero-copy">

                <div class="hd-professional-number">
                    03
                </div>

                <h3>
                    Get Discovered
                </h3>

                <p>
                    Build your professional profile and become
                    discoverable by Home users in your service areas.
                </p>

            </div>

            <div class="hd-professional-hero-image">
                <img
                    src="assets/demo/benefits/get_discovered.png"
                    alt="Get discovered by Home users"
                >
            </div>

        </div>


        <div class="hd-professional-flow">

    <div class="hd-flow-step">
        <div class="hd-flow-icon hd-flow-icon-purple">
            <img
                src="assets/demo/benefits/professional_profile.png"
                alt="Professional Profile"
            >
        </div>
        <span>Professional<br>Profile</span>
    </div>

    <div class="hd-flow-arrow hd-flow-arrow-purple">
        →
    </div>

    <div class="hd-flow-step">
        <div class="hd-flow-icon hd-flow-icon-purple">
            <img
                src="assets/demo/benefits/service_areas.png"
                alt="Service Areas"
            >
        </div>
        <span>Service<br>Areas</span>
    </div>

    <div class="hd-flow-arrow hd-flow-arrow-purple">
        →
    </div>

    <div class="hd-flow-step">
        <div class="hd-flow-icon hd-flow-icon-purple">
            <img
                src="assets/demo/benefits/home_user_discovery.png"
                alt="Home User Discovery"
            >
        </div>
        <span>Home User<br>Discovery</span>
    </div>

</div>


        <button
    class="hd-professional-cta hd-professional-cta-purple"
    type="button"
    data-home-demo-action="complete-professional-profile"
>
    Complete My Professional Profile
    <span>→</span>
</button>

    </div>

</div>

</section>

</section>

            </div>
        `;

        root.style.display =
            "block";

        console.log(
            "🏠 HOME DEMO RENDERED",
            {
                property:
                    project?.name,

                lifestyleAreas:
                    lifestyleCount,

                sources:
                    sourceCount,

                recommendations:
                    recommendationCount
            }
        );
    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.renderHomeDemo =
        renderHomeDemo;

    document.addEventListener("click", function (event) {

        /* =================================================
   SOURCE MARKER → ENVIRONMENTAL SOURCE CARD
   ================================================= */

        const sourceMarker =
            event.target.closest(".hd-source-marker");

        if (sourceMarker) {

            const sourceId =
                sourceMarker.dataset.sourceMarker;

            if (!sourceId) return;

            const sourceCard =
                document.querySelector(
                    `.hd-source-card[data-source-id="${sourceId}"]`
                );

            if (!sourceCard) return;

            sourceCard.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            document
                .querySelectorAll(".hd-source-card.hd-source-card-active")
                .forEach(card => {
                    card.classList.remove("hd-source-card-active");
                });

            sourceCard.classList.add(
                "hd-source-card-active"
            );

            setTimeout(() => {
                sourceCard.classList.remove(
                    "hd-source-card-active"
                );
            }, 1800);

            return;
        }

        /* =================================================
   SOURCE CARD → PROPERTY MARKER
   ================================================= */

        const sourceViewButton =
            event.target.closest(".hd-source-view-link");

        if (sourceViewButton) {

            const sourceId =
                sourceViewButton.dataset.sourceId;

            if (!sourceId) return;

            const sourceMarker =
                document.querySelector(
                    `.hd-source-marker[data-source-marker="${sourceId}"]`
                );

            if (!sourceMarker) return;

            sourceMarker.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            document
                .querySelectorAll(".hd-source-marker.hd-source-marker-active")
                .forEach(marker => {
                    marker.classList.remove(
                        "hd-source-marker-active"
                    );
                });

            sourceMarker.classList.add(
                "hd-source-marker-active"
            );

            setTimeout(() => {
                sourceMarker.classList.remove(
                    "hd-source-marker-active"
                );
            }, 1800);

            return;
        }

        const homeRequestsButton = event.target.closest(
            '[data-home-demo-action="view-home-requests"]'
        );

        if (homeRequestsButton) {

            window.location.href =
                "dashboard.html#home-requests";
            return;
        }

        const createHomePropertyButton = event.target.closest(
            '[data-home-demo-action="create-home-property"]'
        );

        if (createHomePropertyButton) {

            if (
                typeof window.openCreateProjectNamePopup ===
                "function"
            ) {

                window.openCreateProjectNamePopup("home");

            } else {

                console.warn(
                    "⚠️ openCreateProjectNamePopup() not available"
                );
            }

            return;
        }

        const professionalProfileButton = event.target.closest(
            '[data-home-demo-action="complete-professional-profile"]'
        );

        if (professionalProfileButton) {

            if (
                typeof window.openProfessionalProfile ===
                "function"
            ) {

                window.openProfessionalProfile();

            } else {

                console.warn(
                    "⚠️ openProfessionalProfile() not available"
                );
            }

            return;
        }


        const businessDemoButton = event.target.closest(
            '[data-home-demo-action="open-business-demo"]'
        );

        if (businessDemoButton) {

            console.log("🏢 Explore Professional Survey CLICKED");
            console.log(
                "loadBusinessDemoExperience:",
                typeof window.loadBusinessDemoExperience
            );

            if (
                typeof window.loadBusinessDemoExperience ===
                "function"
            ) {

                window.loadBusinessDemoExperience();

            } else {

                console.warn(
                    "⚠️ loadBusinessDemoExperience() not available"
                );
            }

            return;
        }

        // =================================================
        // LIFESTYLE CARD → PLAN
        // =================================================

        const button = event.target.closest(".hd-lifestyle-link");

        const recommendationButton =
            event.target.closest(".hd-lifestyle-recommendation-link");

        if (recommendationButton) {

            const areaId =
                recommendationButton.dataset.lifestyleRecommendation;

            if (!areaId) return;

            const card = document.querySelector(
                `.hd-lifestyle-card[data-lifestyle-card="${areaId}"]`
            );

            if (!card) return;

            card.classList.add("hd-lifestyle-expanded");

            card.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            card.classList.add("hd-lifestyle-highlight");

            setTimeout(() => {
                card.classList.remove("hd-lifestyle-highlight");
            }, 1600);

            return;
        }

        if (button) {

            const areaId = button.dataset.lifestyleArea;

            if (!areaId) return;

            const marker = document.querySelector(
                `.hd-lifestyle-marker[data-lifestyle-marker="${areaId}"]`
            );

            if (!marker) return;

            const overview = document.querySelector(".hd-overview-grid");

            if (overview) {
                overview.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            setTimeout(() => {

                marker.classList.add("hd-lifestyle-marker-active");

                setTimeout(() => {
                    marker.classList.remove("hd-lifestyle-marker-active");
                }, 1600);

            }, 400);

            return;
        }


        // =================================================
        // PLAN MARKER → LIFESTYLE CARD
        // =================================================

        const marker = event.target.closest(".hd-lifestyle-marker");

        if (!marker) return;

        const areaId = marker.dataset.lifestyleMarker;

        if (!areaId) return;


        const card = document.querySelector(
            `.hd-lifestyle-card[data-lifestyle-card="${areaId}"]`
        );

        if (!card) return;

        card.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        card.classList.add("hd-lifestyle-highlight");

        setTimeout(() => {
            card.classList.remove("hd-lifestyle-highlight");
        }, 1600);

    });

})();