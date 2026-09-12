console.log("🔥 PROFESSIONAL PROFILE JS LOADED");

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
        const errorText = await response.text();

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

        document.getElementById(
            "professionalProfileCountryCode"
        ).value =
            profile.country_code || "";

        document.getElementById(
            "professionalProfileCity"
        ).value =
            profile.city || "";

        document.getElementById(
            "professionalProfilePostalCode"
        ).value =
            profile.postal_code || "";

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
// SAVE PROFESSIONAL PROFILE
// =====================================================

async function saveProfessionalProfileForm() {

    const status =
        document.getElementById(
            "professionalProfileStatus"
        );

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
            document.getElementById(
                "professionalProfileCountry"
            ).value.trim(),

        country_code:
            document.getElementById(
                "professionalProfileCountryCode"
            ).value.trim().toUpperCase(),

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
// CLOSE
// =====================================================

function closeProfessionalProfile() {

    const modal =
        document.getElementById(
            "professionalProfileModal"
        );

    if (modal) {
        modal.style.display = "none";
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
