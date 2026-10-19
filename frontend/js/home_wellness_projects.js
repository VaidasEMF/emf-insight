// ==================================================
// HOME WELLNESS — RECENT PROJECTS
// ==================================================

(function () {
    "use strict";

    async function loadHomeWellnessRecentProjects() {
        const container = document.getElementById(
            "myWellnessRecentProjects"
        );

        if (!container) {
            return;
        }

        const API =
            window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1"
                ? "http://127.0.0.1:8000"
                : "https://emf-insight.onrender.com";

        if (typeof getAuthHeaders !== "function") {
            console.error(
                "Home Wellness: getAuthHeaders() unavailable"
            );
            return;
        }

        try {
            const response = await fetch(
                `${API}/projects/me`,
                {
                    method: "GET",
                    cache: "no-store",
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Projects request failed: ${response.status}`
                );
            }

            const result = await response.json();


            const projects = (
                Array.isArray(result)
                    ? result
                    : result.projects || result.data || []
            )
                .filter(project =>
                    String(
                        project.type ||
                        project.project_type ||
                        project.projectType ||
                        ""
                    ).toLowerCase() === "home"
                )
                .sort((a, b) =>
                    new Date(b.updated_at || b.created_at || 0) -
                    new Date(a.updated_at || a.created_at || 0)
                );



            if (projects.length === 0) {
                container.innerHTML = `
                    <div class="my-wellness-project-placeholder">
                        <span aria-hidden="true">+</span>
                        <div>
                            <strong>Start Your First Project</strong>
                            <p>Create a profile for your home or another environment.</p>
                        </div>
                        <button type="button"
                            onclick="openHomeWorkspaceStart()">
                            Create Project
                        </button>
                    </div>
                `;
                return;
            }


            container.innerHTML = projects
                .slice(0, 3)
                .map(project => {
                    const created = project.created_at
                        ? new Date(project.created_at).toLocaleDateString()
                        : "—";

                    const updated = project.updated_at
                        ? new Date(project.updated_at).toLocaleDateString()
                        : "—";

                    return `
            <article class="my-wellness-project-placeholder">
                <div>
                    <strong>${escapeHtml(project.name || "Untitled Project")}</strong>
                    <p>Created: ${created}</p>
                    <p>Updated: ${updated}</p>
                </div>
                <button type="button"
                    onclick="window.openHomeWellnessProject(${Number(project.id)})">
                    Open Project
                </button>
            </article>
        `;
                })
                .join("");

            if (projects.length === 1) {
                container.innerHTML += `
        <div class="my-wellness-project-placeholder">
            <span aria-hidden="true">+</span>
            <div>
                <strong>Add New Project</strong>
                <p>Create another property or environment profile.</p>
            </div>
           <button type="button"
    onclick="createProject()">
    Create Project
</button>
        </div>
    `;
            }


        } catch (error) {
            console.error(
                "Home Wellness recent projects failed:",
                error
            );
        }
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    window.openHomeWellnessProject = async function (projectId) {
        if (window.AppMode?.current !== "home") {
            await window.setAppMode("home");
        }

        const loaded = await window.loadProject(projectId);

        if (loaded) {
            window.myWellnessDashboardOpen = false;

            const dashboard = document.getElementById("myWellnessDashboard");
            if (dashboard) {
                dashboard.hidden = true;
                dashboard.style.display = "none";
            }

            window.updateWorkspaceUI?.();
            window.requestRender?.();
        }
    };

    window.loadHomeWellnessRecentProjects =
        loadHomeWellnessRecentProjects;

    document.addEventListener(
        "DOMContentLoaded",
        loadHomeWellnessRecentProjects
    );
})();