;(function () {
	"use strict";
	var data = globalThis.BP_PORTFOLIO_DATA;
	if (!data || data.version !== 1) return;
	var escapeHtml = function (value) {
		return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
			return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character];
		});
	};
	var safeUrl = function (value) { return /^https:\/\//.test(value || "") ? escapeHtml(value) : ""; };
	var list = function (items, className) {
		if (!items || !items.length) return "";
		return '<ul class="' + className + '">' + items.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") + "</ul>";
	};
	var actionLinks = function (itemLinks) {
		var labels = { github: "GitHub", live: "Live", publication: "Publication", doi: "DOI", arxiv: "arXiv", pdf: "PDF" };
		return Object.keys(labels).map(function (key) {
			var href = safeUrl(itemLinks && itemLinks[key]);
			return href ? '<a class="btn btn-ghost project-side-link" href="' + href + '" target="_blank" rel="noopener noreferrer">' + labels[key] + "</a>" : "";
		}).join("");
	};

	var about = document.querySelector(".about-desc");
	if (about && data.profile.about.length) {
		about.innerHTML = data.profile.about.map(function (paragraph, index) {
			return "<p>" + (index === 0 ? "<strong>Hi, I’m " + escapeHtml(data.profile.name) + ".</strong> " : "") + escapeHtml(paragraph) + "</p>";
		}).join("");
	}

	var timeline = document.querySelector(".timeline-centered");
	if (timeline && data.experience.length) {
		timeline.innerHTML = data.experience.map(function (item, index) {
			var href = safeUrl(item.url);
			var organization = href ? '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(item.organization) + "</a>" : escapeHtml(item.organization);
			return '<article class="timeline-entry reveal-item" data-animate-effect="' + (index % 2 ? "fadeInRight" : "fadeInLeft") + '"><div class="timeline-entry-inner"><div class="timeline-icon color-' + ((index % 5) + 1) + '"><i class="icon-pen2" aria-hidden="true"></i></div><div class="timeline-label card"><h3>' + escapeHtml(item.role) + " | " + organization + " <span>" + escapeHtml(item.startDate + " – " + item.endDate) + "</span></h3><p>" + escapeHtml(item.summary) + "</p>" + list(item.highlights, "experience-highlights") + (item.skills.length ? '<p class="managed-skills"><strong>Skills:</strong> ' + escapeHtml(item.skills.join(" · ")) + "</p>" : "") + "</div></div></article>";
		}).join("") + '<article class="timeline-entry begin reveal-item" aria-hidden="true"><div class="timeline-entry-inner"><div class="timeline-icon color-none"></div></div></article>';
	}

	var projectGrid = document.querySelector(".projects-grid");
	if (projectGrid && data.projects.length) {
		projectGrid.innerHTML = data.projects.map(function (item, index) {
			var tech = item.technologies.map(function (technology) { return '<span class="tech-tag chip">' + escapeHtml(technology) + "</span>"; }).join("");
			return '<article class="blog-entry card project-premium project-detailed reveal-item" data-animate-effect="' + (index % 2 ? "fadeInRight" : "fadeInLeft") + '" data-project-category="' + escapeHtml(item.categories.join(" ")) + '" data-project-search="' + escapeHtml([item.name, item.summary].concat(item.technologies).join(" ").toLowerCase()) + '"><aside class="project-side-panel"><p class="project-side-title">' + escapeHtml(item.date || "Project") + "</p><p><strong>Focus:</strong> " + escapeHtml(item.summary) + '</p><div class="project-side-actions">' + actionLinks(item.links) + '</div></aside><div class="desc"><h3>' + escapeHtml(item.name) + '</h3><p class="project-impact">' + escapeHtml(item.summary) + '</p><div class="tech-tags" aria-label="Tech tags">' + tech + "</div>" + list(item.highlights, "project-highlights") + "</div></article>";
		}).join("");
	}

	var skillsGrid = document.querySelector(".skills-grid");
	if (skillsGrid && data.skills.length) {
		skillsGrid.innerHTML = data.skills.map(function (group) {
			return '<section class="skills-domain" aria-label="' + escapeHtml(group.category) + '"><h3>' + escapeHtml(group.category) + "</h3>" + list(group.items, "managed-skill-list") + "</section>";
		}).join("");
	}

	var researchGrid = document.getElementById("research-publications-grid");
	if (researchGrid && data.publications.length) {
		researchGrid.hidden = false;
		researchGrid.innerHTML = data.publications.map(function (publication) {
			return '<article class="card publication-feature reveal-item" data-animate-effect="fadeInLeft"><div class="card-body"><h3>' + escapeHtml(publication.title) + ' <span class="publication-date">' + escapeHtml(publication.date) + '</span></h3><p class="publication-meta">' + escapeHtml(publication.authors.join(", ")) + " · " + escapeHtml(publication.venue) + " · " + escapeHtml(publication.status) + '</p><p class="publication-summary">' + escapeHtml(publication.summary) + '</p><div class="project-side-actions">' + actionLinks(publication.links) + "</div></div></article>";
		}).join("");
	}

	var scholarItem = document.getElementById("google-scholar-link-item");
	var scholarLink = scholarItem && scholarItem.querySelector("a");
	if (scholarItem) scholarItem.style.display = "none";
	if (scholarItem && scholarLink && safeUrl(data.profile.links.googleScholar)) {
		scholarLink.href = data.profile.links.googleScholar;
		scholarItem.hidden = false;
		scholarItem.style.display = "";
	}
})();
