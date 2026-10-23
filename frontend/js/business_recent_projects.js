
/* ==================================================
   BUSINESS — RECENT PROJECTS
   ================================================== */

(function () {
    "use strict";

    async function loadBusinessRecentProjects() {
        const container = document.getElementById(
            "businessRecentProjectsList"
        );

        if (!container) return;

        const API =
            window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1"
                ? "http://127.0.0.1:8000"
                : "https://emf-insight.onrender.com";

        if (typeof getAuthHeaders !== "function") {
            console.error(
                "Business Recent Projects: getAuthHeaders unavailable"
            );
            return;
        }

        try {
            const response = await fetch(`${API}/projects/me`, {
                method: "GET",
                cache: "no-store",
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(
                    `Projects request failed: ${response.status}`
                );
            }

            const result = await response.json();

            const allProjects = Array.isArray(result)
                ? result
                : result.projects || result.data || [];

            function getProjectType(project) {
                const data =
                    project?.data &&
                        typeof project.data === "object"
                        ? project.data
                        : {};

                const nestedProject = data.project || {};
                const nestedAssessment = data.assessment || {};

                return String(
                    project?.type ||
                    project?.project_type ||
                    project?.projectType ||
                    data.type ||
                    data.project_type ||
                    data.projectType ||
                    nestedProject.type ||
                    nestedProject.project_type ||
                    nestedProject.projectType ||
                    nestedAssessment.type ||
                    nestedAssessment.project_type ||
                    nestedAssessment.projectType ||
                    ""
                ).toLowerCase().trim();
            }

            const projects = allProjects
                .filter(project => getProjectType(project) === "business")
                .sort((a, b) =>
                    new Date(b.updated_at || b.created_at || 0) -
                    new Date(a.updated_at || a.created_at || 0)
                );

            if (projects.length === 0) {
                container.innerHTML = `
                    <div class="business-recent-projects-empty">
                        <strong>No Business projects yet</strong>
                        <p>Create your first Business Survey project.</p>
                        <button type="button"
                            onclick="createProject({type:'business'})">
                            Create Business Project
                        </button>
                    </div>
                `;
                return;
            }

            container.innerHTML = projects.slice(0, 3).map(project => {
                const created = project.created_at
                    ? new Date(project.created_at).toLocaleDateString()
                    : "—";

                const updated = project.updated_at
                    ? new Date(project.updated_at).toLocaleDateString()
                    : "—";

                const projectId = Number(project.id);

                return `
                    <article class="business-recent-project-card">
                        <div class="business-recent-project-info">
                            <strong>${escapeHtml(
                    project.name || "Untitled Project"
                )}</strong>
                            <p>Project #${projectId}</p>
                            <p>Created: ${created}</p>
                            <p>Updated: ${updated}</p>
                        </div>

                        <button type="button"
                            onclick="openBusinessRecentProject(${projectId})">
                            Open Project
                        </button>
                    </article>
                `;
            }).join("");

        } catch (error) {
            console.error(
                "Business Recent Projects failed:",
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

    window.openBusinessRecentProject = async function (projectId) {
        if (window.AppMode?.current !== "business") {
            await window.setAppMode("business");
        }

        const loaded = await window.loadProject(projectId);

        if (loaded) {
            window.updateWorkspaceUI?.();
            window.requestRender?.();
        }
    };

    window.loadBusinessRecentProjects =
        loadBusinessRecentProjects;

    document.addEventListener(
        "DOMContentLoaded",
        loadBusinessRecentProjects
    );
})();
