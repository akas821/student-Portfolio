(() => {
  const p = window.PORTFOLIO_PROFILE || {};
  const skillList = document.getElementById("skillList");
  const renderSkillGroup = (container, heading, skills, className) => {
    if (!container || !Array.isArray(skills) || !skills.length) return;
    const group = document.createElement("section");
    group.className = `skill-group ${className}`;
    const title = document.createElement("h3");
    title.className = "skill-group-title";
    title.textContent = heading;
    const list = document.createElement("div");
    list.className = "skill-chip-list";
    skills.forEach(skill => {
      const item = document.createElement("article");
      item.className = "skill-chip";
      const name = document.createElement("strong");
      name.className = "skill-label";
      name.textContent = skill.name || "Skill";
      const level = document.createElement("span");
      level.className = "skill-level-label";
      level.textContent = skill.level || "Level not specified";
      item.append(name, level);
      list.append(item);
    });
    group.append(title, list);
    container.append(group);
  };
  if (skillList) {
    renderSkillGroup(skillList, "Primary Skills", p.primarySkills || p.skills, "primary-skill-group");
    renderSkillGroup(skillList, "Secondary Skills", p.secondarySkills || [], "secondary-skill-group");
  }
  const languageList = document.getElementById("languageList");
  if (languageList && Array.isArray(p.languages)) {
    p.languages.forEach(language => {
      const card = document.createElement("article");
      card.className = "language-card";
      const name = document.createElement("strong");
      name.className = "language-name";
      name.textContent = language.name || "Language";
      const level = document.createElement("span");
      level.className = "language-level";
      level.textContent = language.level || "Level not specified";

      card.append(name, level);
      languageList.append(card);
    });
  }

  const focusList = document.getElementById("focusList");
  if (focusList && Array.isArray(p.learning)) {
    p.learning.forEach(item => { const li = document.createElement("li"); li.textContent = item; focusList.append(li); });
  }
  const message = document.getElementById("contactMessage");
  if (message && p.contactMessage) message.textContent = p.contactMessage;
  const email = document.getElementById("contactEmail");
  if (email) { email.href = `mailto:${p.email || ""}`; email.textContent = `Email ${p.email || "me"}`; }
  const phone = document.getElementById("contactPhone");
  if (phone) { phone.href = `tel:${(p.phone || "").replace(/[^\d+]/g, "")}`; phone.textContent = `Call ${p.phone || "me"}`; }
  const github = document.getElementById("githubLink");
  if (github && p.github) github.href = p.github;
})();