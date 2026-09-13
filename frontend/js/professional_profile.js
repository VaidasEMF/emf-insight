console.log("🔥 PROFESSIONAL PROFILE JS LOADED");


// =====================================================
// COUNTRY → COUNTRY CODE
// =====================================================

function getCountryCode(country) {
    const countryCodes = {
        "Afghanistan": "AF",
        "Albania": "AL",
        "Algeria": "DZ",
        "Andorra": "AD",
        "Angola": "AO",
        "Antigua and Barbuda": "AG",
        "Argentina": "AR",
        "Armenia": "AM",
        "Australia": "AU",
        "Austria": "AT",
        "Azerbaijan": "AZ",
        "Bahamas": "BS",
        "Bahrain": "BH",
        "Bangladesh": "BD",
        "Barbados": "BB",
        "Belarus": "BY",
        "Belgium": "BE",
        "Belize": "BZ",
        "Benin": "BJ",
        "Bhutan": "BT",
        "Bolivia": "BO",
        "Bosnia and Herzegovina": "BA",
        "Botswana": "BW",
        "Brazil": "BR",
        "Brunei": "BN",
        "Bulgaria": "BG",
        "Burkina Faso": "BF",
        "Burundi": "BI",
        "Cabo Verde": "CV",
        "Cambodia": "KH",
        "Cameroon": "CM",
        "Canada": "CA",
        "Central African Republic": "CF",
        "Chad": "TD",
        "Chile": "CL",
        "China": "CN",
        "Colombia": "CO",
        "Comoros": "KM",
        "Congo": "CG",
        "Costa Rica": "CR",
        "Côte d'Ivoire": "CI",
        "Croatia": "HR",
        "Cuba": "CU",
        "Cyprus": "CY",
        "Czechia": "CZ",
        "Democratic Republic of the Congo": "CD",
        "Denmark": "DK",
        "Djibouti": "DJ",
        "Dominica": "DM",
        "Dominican Republic": "DO",
        "Ecuador": "EC",
        "Egypt": "EG",
        "El Salvador": "SV",
        "Equatorial Guinea": "GQ",
        "Eritrea": "ER",
        "Estonia": "EE",
        "Eswatini": "SZ",
        "Ethiopia": "ET",
        "Fiji": "FJ",
        "Finland": "FI",
        "France": "FR",
        "Gabon": "GA",
        "Gambia": "GM",
        "Georgia": "GE",
        "Germany": "DE",
        "Ghana": "GH",
        "Greece": "GR",
        "Grenada": "GD",
        "Guatemala": "GT",
        "Guinea": "GN",
        "Guinea-Bissau": "GW",
        "Guyana": "GY",
        "Haiti": "HT",
        "Honduras": "HN",
        "Hungary": "HU",
        "Iceland": "IS",
        "India": "IN",
        "Indonesia": "ID",
        "Iran": "IR",
        "Iraq": "IQ",
        "Ireland": "IE",
        "Israel": "IL",
        "Italy": "IT",
        "Jamaica": "JM",
        "Japan": "JP",
        "Jordan": "JO",
        "Kazakhstan": "KZ",
        "Kenya": "KE",
        "Kiribati": "KI",
        "Kuwait": "KW",
        "Kyrgyzstan": "KG",
        "Laos": "LA",
        "Latvia": "LV",
        "Lebanon": "LB",
        "Lesotho": "LS",
        "Liberia": "LR",
        "Libya": "LY",
        "Liechtenstein": "LI",
        "Lithuania": "LT",
        "Luxembourg": "LU",
        "Madagascar": "MG",
        "Malawi": "MW",
        "Malaysia": "MY",
        "Maldives": "MV",
        "Mali": "ML",
        "Malta": "MT",
        "Marshall Islands": "MH",
        "Mauritania": "MR",
        "Mauritius": "MU",
        "Mexico": "MX",
        "Micronesia": "FM",
        "Moldova": "MD",
        "Monaco": "MC",
        "Mongolia": "MN",
        "Montenegro": "ME",
        "Morocco": "MA",
        "Mozambique": "MZ",
        "Myanmar": "MM",
        "Namibia": "NA",
        "Nauru": "NR",
        "Nepal": "NP",
        "Netherlands": "NL",
        "New Zealand": "NZ",
        "Nicaragua": "NI",
        "Niger": "NE",
        "Nigeria": "NG",
        "North Korea": "KP",
        "North Macedonia": "MK",
        "Norway": "NO",
        "Oman": "OM",
        "Pakistan": "PK",
        "Palau": "PW",
        "Palestine": "PS",
        "Panama": "PA",
        "Papua New Guinea": "PG",
        "Paraguay": "PY",
        "Peru": "PE",
        "Philippines": "PH",
        "Poland": "PL",
        "Portugal": "PT",
        "Qatar": "QA",
        "Romania": "RO",
        "Russia": "RU",
        "Rwanda": "RW",
        "Saint Kitts and Nevis": "KN",
        "Saint Lucia": "LC",
        "Saint Vincent and the Grenadines": "VC",
        "Samoa": "WS",
        "San Marino": "SM",
        "Sao Tome and Principe": "ST",
        "Saudi Arabia": "SA",
        "Senegal": "SN",
        "Serbia": "RS",
        "Seychelles": "SC",
        "Sierra Leone": "SL",
        "Singapore": "SG",
        "Slovakia": "SK",
        "Slovenia": "SI",
        "Solomon Islands": "SB",
        "Somalia": "SO",
        "South Africa": "ZA",
        "South Korea": "KR",
        "South Sudan": "SS",
        "Spain": "ES",
        "Sri Lanka": "LK",
        "Sudan": "SD",
        "Suriname": "SR",
        "Sweden": "SE",
        "Switzerland": "CH",
        "Syria": "SY",
        "Tajikistan": "TJ",
        "Tanzania": "TZ",
        "Thailand": "TH",
        "Timor-Leste": "TL",
        "Togo": "TG",
        "Tonga": "TO",
        "Trinidad and Tobago": "TT",
        "Tunisia": "TN",
        "Türkiye": "TR",
        "Turkmenistan": "TM",
        "Tuvalu": "TV",
        "Uganda": "UG",
        "Ukraine": "UA",
        "United Arab Emirates": "AE",
        "United Kingdom": "GB",
        "United States": "US",
        "Uruguay": "UY",
        "Uzbekistan": "UZ",
        "Vanuatu": "VU",
        "Vatican City": "VA",
        "Venezuela": "VE",
        "Vietnam": "VN",
        "Yemen": "YE",
        "Zambia": "ZM",
        "Zimbabwe": "ZW"
    };

    return countryCodes[country] || "";
}


// =====================================================
// LOAD PROFESSIONAL PROFILE
// =====================================================

async function loadProfessionalProfile() {

    const response = await fetch(
        `${API}/professional/profile`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {

        throw new Error(
            `Professional profile load failed: ${response.status}`
        );

    }

    return await response.json();
}


// =====================================================
// SAVE PROFESSIONAL PROFILE
// =====================================================

async function saveProfessionalProfile(data) {

    const response = await fetch(
        `${API}/professional/profile`,
        {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Professional profile save failed: ${response.status} ${errorText}`
        );

    }

    return await response.json();
}


// =====================================================
// OPEN PROFESSIONAL PROFILE
// =====================================================

async function openProfessionalProfile() {

    const modal =
        document.getElementById(
            "professionalProfileModal"
        );

    const status =
        document.getElementById(
            "professionalProfileStatus"
        );

    if (!modal) {

        console.error(
            "Professional Profile modal not found"
        );

        return;
    }

    modal.style.display = "flex";

    initializeProfessionalServiceAreas();
    initializeProfessionalPhoneCountryCode();

    if (status) {

        status.textContent =
            "Loading profile...";

    }

    try {

        const profile =
            await loadProfessionalProfile();


        document.getElementById(
            "professionalProfileFirstName"
        ).value =
            profile.first_name || "";


        document.getElementById(
            "professionalProfileLastName"
        ).value =
            profile.last_name || "";


        document.getElementById(
            "professionalProfileCompanyName"
        ).value =
            profile.company_name || "";


        document.getElementById(
            "professionalProfileEmail"
        ).value =
            profile.professional_email || "";


        document.getElementById(
            "professionalProfilePhone"
        ).value =
            profile.professional_phone || "";


        document.getElementById(
            "professionalProfileCountry"
        ).value =
            profile.country || "";


        // Country Code is now derived from Country.
        // The old manual Country Code input is no longer required.
        const countryCode =
            getCountryCode(
                profile.country || ""
            );

        const countryCodeField =
            document.getElementById(
                "professionalProfileCountryCode"
            );

        if (countryCodeField) {

            countryCodeField.value =
                countryCode;

        }


        document.getElementById(
            "professionalProfileCity"
        ).value =
            profile.city || "";


        document.getElementById(
            "professionalProfilePostalCode"
        ).value =
            profile.postal_code || "";


        // Refresh validation after profile values are loaded.
        initializeProfessionalProfileValidation();

        [
            "professionalProfileFirstName",
            "professionalProfileLastName",
            "professionalProfileCompanyName",
            "professionalProfileEmail",
            "professionalProfilePhone",
            "professionalProfileCity",
            "professionalProfilePostalCode",
            "professionalServiceAreaRegion",
            "professionalServiceAreaCity",
            "professionalServiceAreaPostalCode"
        ].forEach((id) => {

            resetProfessionalFieldValidation(
                document.getElementById(id)
            );
        });

        resetProfessionalFieldValidation(
            document.getElementById(
                "professionalServiceAreaCountry"
            )
        );


        const phoneCountryCode =
            document.getElementById(
                "professionalProfilePhoneCountryCode"
            );

        if (
            phoneCountryCode &&
            profile.country
        ) {
            const option =
                Array.from(phoneCountryCode.options)
                    .find(
                        (item) =>
                            item.dataset.country ===
                            profile.country
                    );

            if (option) {
                phoneCountryCode.value =
                    option.value;
            }
        }


        if (status) {

            status.textContent = "";

        }

    } catch (error) {

        console.error(
            "Professional Profile error:",
            error
        );

        if (status) {

            status.textContent =
                "Unable to load professional profile.";

        }

    }
}



// =====================================================
// SERVICE AREAS
// =====================================================

let professionalServiceAreas = [];

function initializeProfessionalServiceAreaCountry() {

    const countryField =
        document.getElementById(
            "professionalServiceAreaCountry"
        );

    if (!countryField || countryField.options.length > 1) {
        return;
    }

const serviceAreaCountryCodes = {
        "Afghanistan": "AF",
        "Albania": "AL",
        "Algeria": "DZ",
        "Andorra": "AD",
        "Angola": "AO",
        "Antigua and Barbuda": "AG",
        "Argentina": "AR",
        "Armenia": "AM",
        "Australia": "AU",
        "Austria": "AT",
        "Azerbaijan": "AZ",
        "Bahamas": "BS",
        "Bahrain": "BH",
        "Bangladesh": "BD",
        "Barbados": "BB",
        "Belarus": "BY",
        "Belgium": "BE",
        "Belize": "BZ",
        "Benin": "BJ",
        "Bhutan": "BT",
        "Bolivia": "BO",
        "Bosnia and Herzegovina": "BA",
        "Botswana": "BW",
        "Brazil": "BR",
        "Brunei": "BN",
        "Bulgaria": "BG",
        "Burkina Faso": "BF",
        "Burundi": "BI",
        "Cabo Verde": "CV",
        "Cambodia": "KH",
        "Cameroon": "CM",
        "Canada": "CA",
        "Central African Republic": "CF",
        "Chad": "TD",
        "Chile": "CL",
        "China": "CN",
        "Colombia": "CO",
        "Comoros": "KM",
        "Congo": "CG",
        "Costa Rica": "CR",
        "Côte d'Ivoire": "CI",
        "Croatia": "HR",
        "Cuba": "CU",
        "Cyprus": "CY",
        "Czechia": "CZ",
        "Democratic Republic of the Congo": "CD",
        "Denmark": "DK",
        "Djibouti": "DJ",
        "Dominica": "DM",
        "Dominican Republic": "DO",
        "Ecuador": "EC",
        "Egypt": "EG",
        "El Salvador": "SV",
        "Equatorial Guinea": "GQ",
        "Eritrea": "ER",
        "Estonia": "EE",
        "Eswatini": "SZ",
        "Ethiopia": "ET",
        "Fiji": "FJ",
        "Finland": "FI",
        "France": "FR",
        "Gabon": "GA",
        "Gambia": "GM",
        "Georgia": "GE",
        "Germany": "DE",
        "Ghana": "GH",
        "Greece": "GR",
        "Grenada": "GD",
        "Guatemala": "GT",
        "Guinea": "GN",
        "Guinea-Bissau": "GW",
        "Guyana": "GY",
        "Haiti": "HT",
        "Honduras": "HN",
        "Hungary": "HU",
        "Iceland": "IS",
        "India": "IN",
        "Indonesia": "ID",
        "Iran": "IR",
        "Iraq": "IQ",
        "Ireland": "IE",
        "Israel": "IL",
        "Italy": "IT",
        "Jamaica": "JM",
        "Japan": "JP",
        "Jordan": "JO",
        "Kazakhstan": "KZ",
        "Kenya": "KE",
        "Kiribati": "KI",
        "Kuwait": "KW",
        "Kyrgyzstan": "KG",
        "Laos": "LA",
        "Latvia": "LV",
        "Lebanon": "LB",
        "Lesotho": "LS",
        "Liberia": "LR",
        "Libya": "LY",
        "Liechtenstein": "LI",
        "Lithuania": "LT",
        "Luxembourg": "LU",
        "Madagascar": "MG",
        "Malawi": "MW",
        "Malaysia": "MY",
        "Maldives": "MV",
        "Mali": "ML",
        "Malta": "MT",
        "Marshall Islands": "MH",
        "Mauritania": "MR",
        "Mauritius": "MU",
        "Mexico": "MX",
        "Micronesia": "FM",
        "Moldova": "MD",
        "Monaco": "MC",
        "Mongolia": "MN",
        "Montenegro": "ME",
        "Morocco": "MA",
        "Mozambique": "MZ",
        "Myanmar": "MM",
        "Namibia": "NA",
        "Nauru": "NR",
        "Nepal": "NP",
        "Netherlands": "NL",
        "New Zealand": "NZ",
        "Nicaragua": "NI",
        "Niger": "NE",
        "Nigeria": "NG",
        "North Korea": "KP",
        "North Macedonia": "MK",
        "Norway": "NO",
        "Oman": "OM",
        "Pakistan": "PK",
        "Palau": "PW",
        "Palestine": "PS",
        "Panama": "PA",
        "Papua New Guinea": "PG",
        "Paraguay": "PY",
        "Peru": "PE",
        "Philippines": "PH",
        "Poland": "PL",
        "Portugal": "PT",
        "Qatar": "QA",
        "Romania": "RO",
        "Russia": "RU",
        "Rwanda": "RW",
        "Saint Kitts and Nevis": "KN",
        "Saint Lucia": "LC",
        "Saint Vincent and the Grenadines": "VC",
        "Samoa": "WS",
        "San Marino": "SM",
        "Sao Tome and Principe": "ST",
        "Saudi Arabia": "SA",
        "Senegal": "SN",
        "Serbia": "RS",
        "Seychelles": "SC",
        "Sierra Leone": "SL",
        "Singapore": "SG",
        "Slovakia": "SK",
        "Slovenia": "SI",
        "Solomon Islands": "SB",
        "Somalia": "SO",
        "South Africa": "ZA",
        "South Korea": "KR",
        "South Sudan": "SS",
        "Spain": "ES",
        "Sri Lanka": "LK",
        "Sudan": "SD",
        "Suriname": "SR",
        "Sweden": "SE",
        "Switzerland": "CH",
        "Syria": "SY",
        "Tajikistan": "TJ",
        "Tanzania": "TZ",
        "Thailand": "TH",
        "Timor-Leste": "TL",
        "Togo": "TG",
        "Tonga": "TO",
        "Trinidad and Tobago": "TT",
        "Tunisia": "TN",
        "Türkiye": "TR",
        "Turkmenistan": "TM",
        "Tuvalu": "TV",
        "Uganda": "UG",
        "Ukraine": "UA",
        "United Arab Emirates": "AE",
        "United Kingdom": "GB",
        "United States": "US",
        "Uruguay": "UY",
        "Uzbekistan": "UZ",
        "Vanuatu": "VU",
        "Vatican City": "VA",
        "Venezuela": "VE",
        "Vietnam": "VN",
        "Yemen": "YE",
        "Zambia": "ZM",
        "Zimbabwe": "ZW"
    };

    Object.keys(serviceAreaCountryCodes).forEach(
        (country) => {

            const option =
                document.createElement("option");

            option.value = country;
            option.textContent = country;

            countryField.appendChild(option);
        }
    );
}


function renderProfessionalServiceAreas() {

    const list =
        document.getElementById(
            "professionalServiceAreasList"
        );

    if (!list) {
        return;
    }

    list.innerHTML = "";

    professionalServiceAreas.forEach(
        (area, index) => {

            const row =
                document.createElement("div");

            row.style.display = "flex";
            row.style.justifyContent = "space-between";
            row.style.alignItems = "flex-start";
            row.style.gap = "15px";
            row.style.padding = "12px 10px";
            row.style.marginBottom = "8px";
            row.style.border = "1px solid #ddd";
            row.style.borderRadius = "6px";

            const text =
                document.createElement("div");

            text.style.lineHeight = "1.6";

            const country =
                document.createElement("div");

            country.textContent =
                area.country || "";

            country.style.fontWeight = "600";
            country.style.marginBottom = "5px";

            text.appendChild(country);


            if (area.region) {

                const region =
                    document.createElement("div");

                region.textContent =
                    "Region / County: " + area.region;

                text.appendChild(region);
            }


            if (area.city) {

                const city =
                    document.createElement("div");

                city.textContent =
                    "City / Town: " + area.city;

                text.appendChild(city);
            }


            if (area.postal_code) {

                const postal =
                    document.createElement("div");

                postal.textContent =
                    "Postal / Postcode: " +
                    area.postal_code;

                text.appendChild(postal);
            }


            const removeButton =
                document.createElement("button");

            removeButton.type = "button";
            removeButton.textContent = "Remove";

            removeButton.addEventListener(
                "click",
                () => {

                    professionalServiceAreas.splice(
                        index,
                        1
                    );

                    renderProfessionalServiceAreas();
                }
            );

            row.appendChild(text);
            row.appendChild(removeButton);

            list.appendChild(row);
        }
    );
}

function addProfessionalServiceArea() {

    const country =
        document.getElementById(
            "professionalServiceAreaCountry"
        )?.value.trim() || "";

    const region =
        document.getElementById(
            "professionalServiceAreaRegion"
        )?.value.trim() || "";

    const city =
        document.getElementById(
            "professionalServiceAreaCity"
        )?.value.trim() || "";

    const postalCode =
        document.getElementById(
            "professionalServiceAreaPostalCode"
        )?.value.trim() || "";


    if (!country) {

        alert("Please select a country.");

        return;
    }


    const locationTextPattern =
        /^[A-Za-z?-??-??-??-?'? .-]+$/;

    const postalCodePattern =
        /^[A-Za-z0-9][A-Za-z0-9 .-]{1,19}$/;


    if (
        region &&
        (
            region.length < 2 ||
            !locationTextPattern.test(region)
        )
    ) {

        alert(
            "Please enter a valid region or county."
        );

        return;
    }


    if (
        city &&
        (
            city.length < 2 ||
            !locationTextPattern.test(city)
        )
    ) {

        alert(
            "Please enter a valid city or town."
        );

        return;
    }


    if (
        postalCode &&
        !postalCodePattern.test(postalCode)
    ) {

        alert(
            "Please enter a valid postal or postcode."
        );

        return;
    }


    if (!region && !city && !postalCode) {

        alert(
            "Please enter a region, city/town, or postal code."
        );

        return;
    }


    const primaryCountry =
        document.getElementById(
            "professionalProfileCountry"
        )?.value.trim() || "";

    const primaryCity =
        document.getElementById(
            "professionalProfileCity"
        )?.value.trim() || "";

    const primaryPostalCode =
        document.getElementById(
            "professionalProfilePostalCode"
        )?.value.trim() || "";


    const sameAsPrimaryLocation =
        country.toLowerCase() ===
            primaryCountry.toLowerCase() &&
        (
            !city ||
            city.toLowerCase() ===
                primaryCity.toLowerCase()
        ) &&
        (
            !postalCode ||
            postalCode.toLowerCase() ===
                primaryPostalCode.toLowerCase()
        ) &&
        !region;


    if (sameAsPrimaryLocation) {

        alert(
            "Your professional location is already included. Please add a different service area."
        );

        return;
    }


    const duplicate =
        professionalServiceAreas.some(
            (area) =>
                area.country.toLowerCase() ===
                    country.toLowerCase() &&
                area.region.toLowerCase() ===
                    region.toLowerCase() &&
                area.city.toLowerCase() ===
                    city.toLowerCase() &&
                area.postal_code.toLowerCase() ===
                    postalCode.toLowerCase()
        );


    if (duplicate) {

        alert(
            "This service area has already been added."
        );

        return;
    }


    professionalServiceAreas.push({

        country: country,

        region: region,

        city: city,

        postal_code: postalCode
    });


    document.getElementById(
        "professionalServiceAreaRegion"
    ).value = "";

    document.getElementById(
        "professionalServiceAreaCity"
    ).value = "";

    document.getElementById(
        "professionalServiceAreaPostalCode"
    ).value = "";


    renderProfessionalServiceAreas();
}

function initializeProfessionalServiceAreaValidation() {

    const fieldIds = [
        "professionalServiceAreaRegion",
        "professionalServiceAreaCity",
        "professionalServiceAreaPostalCode"
    ];

    fieldIds.forEach((id) => {

        const field = document.getElementById(id);

        if (!field || field.dataset.validationBound) {
            return;
        }

        field.addEventListener("input", () => {

            const value = field.value.trim();

            if (!value) {
                showProfessionalFieldValidation(field, "");
                return;
            }

            let message = "";

            if (
                id === "professionalServiceAreaRegion" ||
                id === "professionalServiceAreaCity"
            ) {
                const pattern =
                    /^[\p{L}][\p{L} .'-]{1,99}$/u;

                if (
                    value.length < 2 ||
                    !pattern.test(value)
                ) {
                    message =
                        id === "professionalServiceAreaRegion"
                            ? "Please enter a valid region or county."
                            : "Please enter a valid city or town.";
                }
            }

            if (id === "professionalServiceAreaPostalCode") {

                const pattern =
                    /^[A-Za-z0-9][A-Za-z0-9 .-]{1,19}$/;

                if (!pattern.test(value)) {
                    message =
                        "Please enter a valid postal or postcode.";
                }
            }

            showProfessionalFieldValidation(
                field,
                message
            );
        });

        field.addEventListener("blur", () => {
            field.dispatchEvent(new Event("input"));
        });

        field.dataset.validationBound = "true";
    });


    const country =
        document.getElementById(
            "professionalServiceAreaCountry"
        );

    if (
        country &&
        !country.dataset.validationBound
    ) {

        country.addEventListener("change", () => {

            if (country.value.trim()) {
                showProfessionalFieldValidation(
                    country,
                    ""
                );
            } else {
                showProfessionalFieldValidation(
                    country,
                    "Please select a country."
                );
            }
        });

        country.dataset.validationBound = "true";
    }
}

function initializeProfessionalServiceAreas() {

    initializeProfessionalServiceAreaCountry();
    initializeProfessionalServiceAreaValidation();
    const completeHomeButton =
        document.getElementById(
            "professionalCompleteHomeProfileButton"
        );

    if (
        completeHomeButton &&
        !completeHomeButton.dataset.bound
    ) {
        completeHomeButton.addEventListener(
            "click",
            startHomeProfileCompletion
        );

        completeHomeButton.dataset.bound = "1";
    }

    const requestVerificationButton =
        document.getElementById(
            "professionalRequestVerificationButton"
        );

    if (
        requestVerificationButton &&
        !requestVerificationButton.dataset.bound
    ) {
        requestVerificationButton.addEventListener(
            "click",
            requestProfessionalVerification
        );

        requestVerificationButton.dataset.bound = "1";
    }



    const addButton =
        document.getElementById(
            "professionalServiceAreaAdd"
        );

    if (
        addButton &&
        !addButton.dataset.bound
    ) {

        addButton.addEventListener(
            "click",
            addProfessionalServiceArea
        );

        addButton.dataset.bound = "1";
    }

    renderProfessionalServiceAreas();
}



// =====================================================
// PROFESSIONAL PROFILE VALIDATION
// =====================================================

function getProfessionalFieldError(field) {

    if (!field) {
        return "";
    }

    const value = field.value.trim();
    const id = field.id;

    if (!value) {
        return "";
    }

    const namePattern =
        /^[\p{L}][\p{L} .'-]{1,99}$/u;

    const locationPattern =
        /^[\p{L}][\p{L} .'-]{1,99}$/u;

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const phonePattern =
        /^\+?[0-9][0-9 ()-]{6,24}$/;

    const postalPattern =
        /^[A-Za-z0-9][A-Za-z0-9 .-]{1,19}$/;


    if (
        id === "professionalProfileFirstName" ||
        id === "professionalProfileLastName"
    ) {
        if (!namePattern.test(value)) {
            return "Please enter a valid name.";
        }
    }


    if (id === "professionalProfileCompanyName") {

        if (
            value.length < 2 ||
            value.length > 200
        ) {
            return "Please enter a valid company name.";
        }
    }


    if (id === "professionalProfileEmail") {

        if (!emailPattern.test(value)) {
            return "Please enter a valid professional email.";
        }
    }


    if (id === "professionalProfilePhone") {

        if (!phonePattern.test(value)) {
            return "Please enter a valid professional phone number.";
        }
    }


    if (id === "professionalProfileCity") {

        if (!locationPattern.test(value)) {
            return "Please enter a valid city or town.";
        }
    }


    if (id === "professionalProfilePostalCode") {

        if (!postalPattern.test(value)) {
            return "Please enter a valid postal or postcode.";
        }
    }


    return "";
}


function showProfessionalFieldValidation(
    field,
    message
) {

    if (!field) {
        return;
    }

    let error =
        field.parentElement.querySelector(
            ".professional-field-error"
        );

    if (!error) {

        error =
            document.createElement("div");

        error.className =
            "professional-field-error";

        error.style.fontSize = "12px";
        error.style.marginTop = "4px";

        field.parentElement.appendChild(error);
    }


    if (message) {

        error.textContent = message;

        error.style.display = "block";

        field.style.borderColor = "#c62828";

    } else {

        error.textContent = "OK";

        error.style.display = "block";

        error.style.color = "#2e7d32";

        field.style.borderColor = "#2e7d32";
    }
}


function resetProfessionalFieldValidation(
    field
) {

    if (!field) {
        return;
    }

    const error =
        field.parentElement.querySelector(
            ".professional-field-error"
        );

    if (error) {
        error.style.display = "none";
    }

    field.style.borderColor = "";
}

function validateProfessionalField(
    field
) {

    if (!field) {
        return true;
    }

    const message =
        getProfessionalFieldError(field);

    if (message) {

        showProfessionalFieldValidation(
            field,
            message
        );

        return false;
    }

    if (field.value.trim()) {

        showProfessionalFieldValidation(
            field,
            ""
        );

    } else {

        const error =
            field.parentElement.querySelector(
                ".professional-field-error"
            );

        if (error) {
            error.style.display = "none";
        }

        field.style.borderColor = "";
    }

    return true;
}


function initializeProfessionalProfileValidation() {

    const fieldIds = [
        "professionalProfileFirstName",
        "professionalProfileLastName",
        "professionalProfileCompanyName",
        "professionalProfileEmail",
        "professionalProfilePhone",
        "professionalProfileCity",
        "professionalProfilePostalCode"
    ];

    fieldIds.forEach((id) => {

        const field = document.getElementById(id);

        if (!field || field.dataset.validationBound) {
            return;
        }

        field.addEventListener("input", () => {
            validateProfessionalField(field);
        });

        field.addEventListener("blur", () => {
            validateProfessionalField(field);
        });

        field.dataset.validationBound = "true";
    });
}

function initializeProfessionalPhoneCountryCode() {

    const countryField =
        document.getElementById(
            "professionalProfileCountry"
        );

    const codeField =
        document.getElementById(
            "professionalProfilePhoneCountryCode"
        );

    if (!countryField || !codeField) {
        return;
    }

    if (codeField.dataset.initialized) {
        return;
    }


    const callingCodes = {

        "Afghanistan": "93",
        "Albania": "355",
        "Algeria": "213",
        "Andorra": "376",
        "Angola": "244",
        "Antigua and Barbuda": "1",
        "Argentina": "54",
        "Armenia": "374",
        "Australia": "61",
        "Austria": "43",
        "Azerbaijan": "994",
        "Bahamas": "1",
        "Bahrain": "973",
        "Bangladesh": "880",
        "Barbados": "1",
        "Belarus": "375",
        "Belgium": "32",
        "Belize": "501",
        "Benin": "229",
        "Bhutan": "975",
        "Bolivia": "591",
        "Bosnia and Herzegovina": "387",
        "Botswana": "267",
        "Brazil": "55",
        "Brunei": "673",
        "Bulgaria": "359",
        "Burkina Faso": "226",
        "Burundi": "257",
        "Cabo Verde": "238",
        "Cambodia": "855",
        "Cameroon": "237",
        "Canada": "1",
        "Central African Republic": "236",
        "Chad": "235",
        "Chile": "56",
        "China": "86",
        "Colombia": "57",
        "Comoros": "269",
        "Congo": "242",
        "Costa Rica": "506",
        "Croatia": "385",
        "Cuba": "53",
        "Cyprus": "357",
        "Czechia": "420",
        "Denmark": "45",
        "Djibouti": "253",
        "Dominica": "1",
        "Dominican Republic": "1",
        "Ecuador": "593",
        "Egypt": "20",
        "El Salvador": "503",
        "Equatorial Guinea": "240",
        "Eritrea": "291",
        "Estonia": "372",
        "Eswatini": "268",
        "Ethiopia": "251",
        "Fiji": "679",
        "Finland": "358",
        "France": "33",
        "Gabon": "241",
        "Gambia": "220",
        "Georgia": "995",
        "Germany": "49",
        "Ghana": "233",
        "Greece": "30",
        "Grenada": "1",
        "Guatemala": "502",
        "Guinea": "224",
        "Guinea-Bissau": "245",
        "Guyana": "592",
        "Haiti": "509",
        "Honduras": "504",
        "Hungary": "36",
        "Iceland": "354",
        "India": "91",
        "Indonesia": "62",
        "Iran": "98",
        "Iraq": "964",
        "Ireland": "353",
        "Israel": "972",
        "Italy": "39",
        "Jamaica": "1",
        "Japan": "81",
        "Jordan": "962",
        "Kazakhstan": "7",
        "Kenya": "254",
        "Kiribati": "686",
        "Kuwait": "965",
        "Kyrgyzstan": "996",
        "Laos": "856",
        "Latvia": "371",
        "Lebanon": "961",
        "Lesotho": "266",
        "Liberia": "231",
        "Libya": "218",
        "Liechtenstein": "423",
        "Lithuania": "370",
        "Luxembourg": "352",
        "Madagascar": "261",
        "Malawi": "265",
        "Malaysia": "60",
        "Maldives": "960",
        "Mali": "223",
        "Malta": "356",
        "Marshall Islands": "692",
        "Mauritania": "222",
        "Mauritius": "230",
        "Mexico": "52",
        "Micronesia": "691",
        "Moldova": "373",
        "Monaco": "377",
        "Mongolia": "976",
        "Montenegro": "382",
        "Morocco": "212",
        "Mozambique": "258",
        "Myanmar": "95",
        "Namibia": "264",
        "Nauru": "674",
        "Nepal": "977",
        "Netherlands": "31",
        "New Zealand": "64",
        "Nicaragua": "505",
        "Niger": "227",
        "Nigeria": "234",
        "North Korea": "850",
        "North Macedonia": "389",
        "Norway": "47",
        "Oman": "968",
        "Pakistan": "92",
        "Palau": "680",
        "Palestine": "970",
        "Panama": "507",
        "Papua New Guinea": "675",
        "Paraguay": "595",
        "Peru": "51",
        "Philippines": "63",
        "Poland": "48",
        "Portugal": "351",
        "Qatar": "974",
        "Romania": "40",
        "Russia": "7",
        "Rwanda": "250",
        "Saint Kitts and Nevis": "1",
        "Saint Lucia": "1",
        "Saint Vincent and the Grenadines": "1",
        "Samoa": "685",
        "San Marino": "378",
        "Sao Tome and Principe": "239",
        "Saudi Arabia": "966",
        "Senegal": "221",
        "Serbia": "381",
        "Seychelles": "248",
        "Sierra Leone": "232",
        "Singapore": "65",
        "Slovakia": "421",
        "Slovenia": "386",
        "Solomon Islands": "677",
        "Somalia": "252",
        "South Africa": "27",
        "South Korea": "82",
        "South Sudan": "211",
        "Spain": "34",
        "Sri Lanka": "94",
        "Sudan": "249",
        "Suriname": "597",
        "Sweden": "46",
        "Switzerland": "41",
        "Syria": "963",
        "Taiwan": "886",
        "Tajikistan": "992",
        "Tanzania": "255",
        "Thailand": "66",
        "Timor-Leste": "670",
        "Togo": "228",
        "Tonga": "676",
        "Trinidad and Tobago": "1",
        "Tunisia": "216",
        "T?rkiye": "90",
        "Turkmenistan": "993",
        "Tuvalu": "688",
        "Uganda": "256",
        "Ukraine": "380",
        "United Arab Emirates": "971",
        "United Kingdom": "44",
        "United States": "1",
        "Uruguay": "598",
        "Uzbekistan": "998",
        "Vanuatu": "678",
        "Vatican City": "39",
        "Venezuela": "58",
        "Vietnam": "84",
        "Yemen": "967",
        "Zambia": "260",
        "Zimbabwe": "263"
    };


    Array.from(countryField.options).forEach(
        (option) => {

            const country =
                option.value.trim();

            if (!country) {
                return;
            }

            const code =
                callingCodes[country];

            if (!code) {
                return;
            }

            const phoneOption =
                document.createElement("option");

            phoneOption.value = code;

            phoneOption.textContent =
                `${country} +${code}`;

            phoneOption.dataset.country =
                country;

            codeField.appendChild(
                phoneOption
            );
        }
    );


    countryField.addEventListener(
        "change",
        () => {

            const country =
                countryField.value.trim();

            const code =
                callingCodes[country];

            codeField.value =
                code || "";
        }
    );


    codeField.dataset.initialized = "1";
}


// =====================================================
// SAVE PROFESSIONAL PROFILE FORM
// =====================================================

function validateProfessionalProfileForSave() {

    const fieldIds = [
        "professionalProfileFirstName",
        "professionalProfileLastName",
        "professionalProfileCompanyName",
        "professionalProfileEmail",
        "professionalProfilePhone",
        "professionalProfileCity",
        "professionalProfilePostalCode"
    ];

    for (const id of fieldIds) {

        const field =
            document.getElementById(id);

        if (!field) {
            continue;
        }

        validateProfessionalField(field);

        if (getProfessionalFieldError(field)) {
            return false;
        }
    }

    return true;
}
async function saveProfessionalProfileForm() {

    if (!validateProfessionalProfileForSave()) {
        return;
    }

    const status =
        document.getElementById(
            "professionalProfileStatus"
        );


    const country =
        document.getElementById(
            "professionalProfileCountry"
        ).value.trim();


    const data = {

        first_name:
            document.getElementById(
                "professionalProfileFirstName"
            ).value.trim(),


        last_name:
            document.getElementById(
                "professionalProfileLastName"
            ).value.trim(),


        company_name:
            document.getElementById(
                "professionalProfileCompanyName"
            ).value.trim(),


        professional_email:
            document.getElementById(
                "professionalProfileEmail"
            ).value.trim(),


        professional_phone:
            document.getElementById(
                "professionalProfilePhone"
            ).value.trim(),


        country:
            country,


        // Automatically derived from selected Country.
        country_code:
            getCountryCode(country),


        city:
            document.getElementById(
                "professionalProfileCity"
            ).value.trim(),


        postal_code:
            document.getElementById(
                "professionalProfilePostalCode"
            ).value.trim()

    };


    if (status) {

        status.textContent =
            "Saving...";

    }


    try {

        await saveProfessionalProfile(data);


        if (status) {

            status.textContent =
                "Profile saved.";

        }


        closeProfessionalProfile();


    } catch (error) {

        console.error(
            "Professional Profile save error:",
            error
        );


        if (status) {

            status.textContent =
                "Unable to save professional profile.";

        }

    }
}



// =====================================================
// HOME PROFILE COMPLETION
// =====================================================

function validateProfessionalProfileForHome() {

    const requiredFields = [
        {
            id: "professionalProfileFirstName",
            label: "First Name"
        },
        {
            id: "professionalProfileLastName",
            label: "Last Name"
        },
        {
            id: "professionalProfileCompanyName",
            label: "Company"
        },
        {
            id: "professionalProfileEmail",
            label: "Professional Email"
        },
        {
            id: "professionalProfilePhone",
            label: "Phone"
        },
        {
            id: "professionalProfileCountry",
            label: "Country"
        },
        {
            id: "professionalProfileCity",
            label: "City / Town"
        },
        {
            id: "professionalProfilePostalCode",
            label: "Postal / Postcode"
        }
    ];

    let complete = true;

    requiredFields.forEach((item) => {

        const field =
            document.getElementById(item.id);

        if (!field) {
            return;
        }

        const value =
            field.value.trim();

        if (!value) {

            showProfessionalFieldValidation(
                field,
                "This field is required for Home Projects."
            );

            complete = false;
            return;
        }

        if (!validateProfessionalField(field)) {
            complete = false;
        }
    });

    const primaryCountry =
        document.getElementById(
            "professionalProfileCountry"
        )?.value.trim() || "";

    const primaryCity =
        document.getElementById(
            "professionalProfileCity"
        )?.value.trim() || "";

    if (!primaryCountry || !primaryCity) {
        complete = false;
    }

    return complete;
}

async function requestProfessionalVerification() {

    const confirmed = window.confirm(
        "Submit your professional profile for verification?"
    );

    if (!confirmed) {
        return;
    }

    const status =
        document.getElementById(
            "professionalProfileStatus"
        );

    const completionStatus =
        document.getElementById(
            "professionalHomeProfileCompletionStatus"
        );

    const verificationButton =
        document.getElementById(
            "professionalRequestVerificationButton"
        );

    if (status) {
        status.textContent =
            "Submitting your profile for verification...";
    }

    try {

        const response = await fetch(
            `${API}/professional/profile/request-verification`,
            {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json"
                }
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail?.message ||
                result.detail ||
                "Unable to submit verification request."
            );
        }

        if (status) {
            status.textContent =
                "Your verification request has been submitted.";
        }

        if (completionStatus) {
            completionStatus.textContent =
                "Verification Pending";
        }

        if (verificationButton) {
            verificationButton.style.display = "none";
        }

    } catch (error) {

        console.error(
            "Professional verification request failed:",
            error
        );

        if (status) {
            status.textContent =
                error.message ||
                "Unable to submit verification request.";
        }
    }
}

function startHomeProfileCompletion() {

    const status =
        document.getElementById(
            "professionalProfileStatus"
        );

    const completionStatus =
        document.getElementById(
            "professionalHomeProfileCompletionStatus"
        );

    const completeButton =
        document.getElementById(
            "professionalCompleteHomeProfileButton"
        );

    const verificationButton =
        document.getElementById(
            "professionalRequestVerificationButton"
        );

    if (!validateProfessionalProfileForHome()) {

        if (status) {
            status.textContent =
                "Please complete the highlighted fields to become eligible for Home Projects.";
        }

        if (completionStatus) {
            completionStatus.textContent =
                "Profile incomplete";
        }

        if (completeButton) {
            completeButton.style.display = "";
        }

        if (verificationButton) {
            verificationButton.style.display = "none";
        }

        return;
    }

    if (status) {
        status.textContent =
            "Your profile is complete and ready for Home verification.";
    }

    if (completionStatus) {
        completionStatus.textContent =
            "Profile Complete";
    }

    if (completeButton) {
        completeButton.style.display = "none";
    }

    if (verificationButton) {
        verificationButton.style.display = "";
    }
}


// =====================================================
// CLOSE
// =====================================================

function closeProfessionalProfile() {

    const modal =
        document.getElementById(
            "professionalProfileModal"
        );

    if (modal) {

        modal.style.display =
            "none";

    }
}


// =====================================================
// EXPOSE FUNCTIONS FOR INLINE HTML HANDLERS
// =====================================================

window.openProfessionalProfile =
    openProfessionalProfile;

window.closeProfessionalProfile =
    closeProfessionalProfile;

window.saveProfessionalProfileForm =
    saveProfessionalProfileForm;

window.startHomeProfileCompletion =
    startHomeProfileCompletion;