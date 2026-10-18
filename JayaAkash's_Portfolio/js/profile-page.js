(() => {
  const p = window.PORTFOLIO_PROFILE || {};
  const set = (id, value) => { const el = document.getElementById(id); if (el && value) el.textContent = value; };
  set("studentNameHeading", p.name);
  set("headline", p.headline);
  set("college", p.college);
  set("course", p.course);
  set("location", p.location);
  set("phone", p.phone);
  set("experience", p.experience);
  set("summary", p.summary);
  set("eagerness", p.eagerness);
  set("footerName", p.name);
  set("brandName", p.name);
  const emailLink = document.getElementById("emailLink");
  if (emailLink) { emailLink.textContent = p.email || ""; emailLink.href = `mailto:${p.email || ""}`; }

  const quickSkills = document.getElementById("quickSkills");
  if (quickSkills && Array.isArray(p.quickSkills)) {
    quickSkills.replaceChildren(...p.quickSkills.map(skill => {
      const span = document.createElement("span"); span.textContent = skill; return span;
    }));
  }

  const educationTimeline = document.getElementById("educationTimeline");
  if (educationTimeline && Array.isArray(p.education)) {
    educationTimeline.replaceChildren(...p.education.map(item => {
      const article = document.createElement("article");
      article.className = "education-item";
      const dot = document.createElement("span");
      dot.className = "education-dot";
      dot.setAttribute("aria-hidden", "true");
      const body = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = item.level || "Education";
      const institution = document.createElement("p");
      institution.className = "education-institution";
      institution.textContent = item.institution || "Add institution name";
      const qualification = document.createElement("p");
      qualification.className = "education-qualification";
      qualification.textContent = item.qualification || "Add qualification";
      const years = document.createElement("span");
      years.className = "education-years";
      years.textContent = `${item.startYear || "Start year"} — ${item.endYear || "End year"}`;
      body.append(title, institution, qualification, years);
      article.append(dot, body);
      return article;
    }));
  }

  // Decorative particle field appears behind the static profile image on hover.
  const photoArea = document.getElementById("profilePhotoArea");
  const canvas = document.getElementById("profileParticles");
  if (photoArea && canvas) {
    const ctx = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let particles = [], frame = 0, active = false, width = 0, height = 0;
    const resize = () => {
      const rect = photoArea.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({length: 42}, () => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - .5) * .7, vy: (Math.random() - .5) * .7,
        r: 1 + Math.random() * 2.2, phase: Math.random() * Math.PI * 2
      }));
      draw();
    };
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (!active) { frame = 0; return; }
      particles.forEach(pt => {
        pt.phase += .035;
        if (!reducedMotion) { pt.x += pt.vx; pt.y += pt.vy; }
        if (pt.x < 0 || pt.x > width) pt.vx *= -1;
        if (pt.y < 0 || pt.y > height) pt.vy *= -1;
        const alpha = .35 + (Math.sin(pt.phase) + 1) * .25;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(216,255,62,${alpha})`; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y, dist = Math.hypot(dx, dy);
          if (dist < 65) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(216,255,62,${(1 - dist / 65) * .25})`;
            ctx.lineWidth = .7; ctx.stroke();
          }
        }
      }
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };
    const activate = () => { active = true; canvas.classList.add("is-visible"); if (!frame) draw(); };
    const deactivate = () => { active = false; canvas.classList.remove("is-visible"); if (frame) cancelAnimationFrame(frame); frame = 0; ctx.clearRect(0, 0, width, height); };
    photoArea.addEventListener("pointerenter", activate);
    photoArea.addEventListener("pointerleave", deactivate);
    window.addEventListener("resize", resize);
    resize();
  }

  // Display the configured profile image only; no picker or drag-and-drop.
  const image = document.getElementById("studentPhoto");
  if (image && p.profileImage) {
    image.src = p.profileImage;
    image.onerror = () => {
      image.onerror = null;
      image.src = "assets/profile-placeholder.svg";
      console.warn("Profile image was not found. Check profileImage in js/profile.js.");
    };
  }
})();