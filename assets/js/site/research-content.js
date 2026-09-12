;(function () {
  "use strict";
  var data = globalThis.BP_PORTFOLIO_DATA;
  if (!data || data.version !== 1) return;

  var profileLinks = document.querySelector(".profile-links");
  if (profileLinks && data.profile && data.profile.links) {
    [
      ["Google Scholar", data.profile.links.googleScholar],
      ["Semantic Scholar", data.profile.links.semanticScholar]
    ].forEach(function (entry) {
      var existing = Array.prototype.find.call(profileLinks.querySelectorAll("a"), function (link) {
        return link.textContent.includes(entry[0]);
      });
      if (existing && /^https:\/\//.test(entry[1] || "")) existing.href = entry[1];
    });
  }

  var papers = data.publications.filter(function (paper) {
    return paper.links && /^https:\/\//.test(paper.links.arxiv || paper.links.doi || "");
  });
  if (data.sourceCommit === "initial-migration" || !papers.length) return;
  var paperList = document.querySelector(".paper-list");
  if (!paperList) return;
  paperList.replaceChildren();

  papers.forEach(function (paper, index) {
    var card = document.createElement("article");
    var marker = document.createElement("div");
    var content = document.createElement("div");
    var meta = document.createElement("p");
    var title = document.createElement("h3");
    var authors = document.createElement("p");
    var summary = document.createElement("p");
    var links = document.createElement("div");
    card.className = "paper-card";
    marker.className = "paper-card__marker";
    content.className = "paper-card__content";
    meta.className = "paper-meta";
    authors.className = "paper-authors";
    links.className = "paper-links";

    var year = (paper.date || "").match(/\b20\d{2}\b/);
    [year ? year[0] : "Paper", String(index + 1).padStart(2, "0")].forEach(function (value) {
      var span = document.createElement("span");
      span.textContent = value;
      marker.appendChild(span);
    });
    meta.textContent = [paper.date, paper.venue, paper.status].filter(Boolean).join(" · ");
    title.textContent = paper.title;
    authors.textContent = (paper.authors || []).join(" · ");
    summary.textContent = paper.summary;
    [["Paper on arXiv", paper.links.arxiv], ["PDF", paper.links.pdf], ["DOI", paper.links.doi]].forEach(function (entry) {
      if (!/^https:\/\//.test(entry[1] || "")) return;
      var link = document.createElement("a");
      link.href = entry[1];
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = entry[0] + " ↗";
      links.appendChild(link);
    });

    content.append(meta, title, authors, summary, links);
    card.append(marker, content);
    paperList.appendChild(card);
  });
})();
