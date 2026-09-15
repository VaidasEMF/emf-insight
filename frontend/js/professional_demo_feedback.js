(function () {
  const FEEDBACK_API = `${API}/professional-demo-feedback/`;

  let feedbackSubmitted = false;

  function getFeedbackToken() {
    return localStorage.getItem("token");
  }

  async function loadProfessionalDemoFeedbackState() {
    const token = getFeedbackToken();
    const section = document.getElementById(
      "professionalDemoFeedbackSection"
    );

    if (!token || !section) return;

    section.style.display = "none";

    try {
      const meResponse = await fetch(`${API}/me`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!meResponse.ok) return;

      const me = await meResponse.json();

      if (me.professional_demo_active !== true) {
        return;
      }

      section.style.display = "";

      const response = await fetch(
        `${API}/professional-demo-feedback/my`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      feedbackSubmitted = data.submitted === true;

      updateProfessionalDemoFeedbackUI();
    } catch (error) {
      console.error(
        "Failed to load Professional Demo feedback state:",
        error
      );
    }
  }

  function updateProfessionalDemoFeedbackUI() {
    const button = document.getElementById("professionalDemoFeedbackButton");
    if (!button) return;

    if (feedbackSubmitted) {
      button.textContent = "Feedback Submitted";
      button.disabled = true;
      button.classList.add("feedback-submitted");
    } else {
      button.textContent = "Demo Feedback";
      button.disabled = false;
      button.classList.remove("feedback-submitted");
    }
  }

  window.openProfessionalDemoFeedback = function () {
    if (feedbackSubmitted) return;

    const modal = document.getElementById("professionalDemoFeedbackModal");
    if (!modal) return;

    modal.classList.remove("hidden");
  };

  window.closeProfessionalDemoFeedback = function () {
    const modal = document.getElementById("professionalDemoFeedbackModal");
    if (!modal) return;

    modal.classList.add("hidden");
  };

  window.submitProfessionalDemoFeedback = async function () {
    const form = document.getElementById("professionalDemoFeedbackForm");
    if (!form) return;

    const token = getFeedbackToken();
    if (!token) {
      alert("Please log in again before submitting feedback.");
      return;
    }

    const data = {
      overall_rating: Number(form.overall_rating.value),
      business_survey_rating: Number(form.business_survey_rating.value),
      measurements_rating: Number(form.measurements_rating.value),
      results_rating: Number(form.results_rating.value),
      pdf_rating: Number(form.pdf_rating.value),
      confusing_text: form.confusing_text.value.trim() || null,
      missing_features: form.missing_features.value.trim() || null,
      bugs_text: form.bugs_text.value.trim() || null,
      improvements_text: form.improvements_text.value.trim() || null,
      professional_use: form.professional_use.value || null,
      recommendation_score:
        form.recommendation_score.value === ""
          ? null
          : Number(form.recommendation_score.value)
    };

    if (
      !data.overall_rating ||
      !data.business_survey_rating ||
      !data.measurements_rating ||
      !data.results_rating ||
      !data.pdf_rating
    ) {
      alert("Please rate all five sections before submitting.");
      return;
    }

    const submitButton = document.getElementById(
      "professionalDemoFeedbackSubmit"
    );

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    try {
      const response = await fetch(FEEDBACK_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to submit feedback."
        );
      }

      feedbackSubmitted = true;

      localStorage.removeItem(
        "professional_demo_feedback_prompt_count"
      );

      closeProfessionalDemoFeedback();
      updateProfessionalDemoFeedbackUI();

      alert("Thank you - your feedback has been submitted.");
    } catch (error) {
      console.error(
        "Failed to submit Professional Demo feedback:",
        error
      );

      alert(
        error.message ||
        "Failed to submit feedback."
      );

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Feedback";
      }
    }
  };

    window.maybePromptProfessionalDemoFeedback = function () {
      const token = getFeedbackToken();

    if (!token || feedbackSubmitted) return;

    const promptCount =
      Number(
        localStorage.getItem(
          "professional_demo_feedback_prompt_count"
        ) || "0"
      );

    if (promptCount >= 3) return;

    if (
      document.getElementById(
        "professionalDemoFeedbackPrompt"
      )
    ) {
      return;
    }

    const prompt =
      document.createElement("div");

    prompt.id =
      "professionalDemoFeedbackPrompt";

    prompt.style.position = "fixed";
    prompt.style.inset = "0";
    prompt.style.display = "flex";
    prompt.style.alignItems = "center";
    prompt.style.justifyContent = "center";
    prompt.style.background = "rgba(15, 23, 42, 0.42)";
    prompt.style.zIndex = "10000";
    prompt.style.padding = "20px";
    prompt.style.boxSizing = "border-box";

    prompt.innerHTML =
      "<div style=\"width:min(520px, 92vw); background:#fff; border-radius:14px; padding:30px; box-shadow:0 20px 50px rgba(0,0,0,.18); text-align:center;\">" +
      "<h2 style=\"margin:0 0 12px;\">Help us improve EMF Maps</h2>" +
      "<p style=\"margin:0 0 24px; color:#64748b; line-height:1.5;\">You've completed the main Professional Demo workflow. We'd really appreciate your feedback - it takes about 2 minutes.</p>" +
      "<div style=\"display:flex; justify-content:center; gap:12px; align-items:center;\">" +
      "<button type=\"button\" id=\"professionalDemoFeedbackPromptButton\" style=\"padding:11px 18px; border:0; border-radius:8px; background:#17202a; color:#fff; font-weight:600; cursor:pointer;\">Give Feedback</button>" +
      "<button type=\"button\" id=\"professionalDemoFeedbackPromptSkip\" style=\"padding:11px 14px; border:0; background:transparent; color:#64748b; cursor:pointer;\">Skip for now</button>" +
      "</div>" +
      "</div>";

    document.body.appendChild(prompt);

    const giveFeedbackButton =
      document.getElementById(
        "professionalDemoFeedbackPromptButton"
      );

    const skipButton =
      document.getElementById(
        "professionalDemoFeedbackPromptSkip"
      );

    giveFeedbackButton?.addEventListener(
      "click",
      function () {
        prompt.remove();
        openProfessionalDemoFeedback();
      }
    );

    skipButton?.addEventListener(
      "click",
      function () {
        const nextCount =
          promptCount + 1;

        localStorage.setItem(
          "professional_demo_feedback_prompt_count",
          String(nextCount)
        );

        prompt.remove();
      }
    );
  };

  window.loadProfessionalDemoFeedbackState =
    loadProfessionalDemoFeedbackState;

  document.addEventListener("DOMContentLoaded", function () {
    loadProfessionalDemoFeedbackState();
  });
})();