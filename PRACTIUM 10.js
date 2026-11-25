/* =====================================================================
   SCRIPT.JS - interaction logic for the animated TalentBridge portal
   Uses: addEventListener(), classList.add / remove / toggle, setTimeout()
   ===================================================================== */
document.addEventListener("DOMContentLoaded", function () {

  /* ---------- 1. TOAST NOTIFICATIONS ---------- */
  var toastBox = document.getElementById("toast-container");

  function showToast(message, type) {
    var toast = document.createElement("div");
    toast.className = "toast toast-" + (type || "success");

    var icon = document.createElement("span");
    icon.className = "toast-icon";
    icon.textContent = type === "error" ? "!" : type === "info" ? "i" : "\u2713";

    var text = document.createElement("span");
    text.className = "toast-text";
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    toastBox.appendChild(toast);

    // after 3.5s slide the toast out, then remove it from the page
    setTimeout(function () {
      toast.classList.add("leaving");
      setTimeout(function () { toast.remove(); }, 400);
    }, 3500);

    // click a toast to dismiss it early
    toast.addEventListener("click", function () {
      toast.classList.add("leaving");
      setTimeout(function () { toast.remove(); }, 400);
    });
  }

  /* ---------- 2. SCROLL REVEAL (sections fade up) ---------- */
  var sections = document.querySelectorAll("main > section");
  sections.forEach(function (s) { s.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    sections.forEach(function (s) { observer.observe(s); });
  } else {
    sections.forEach(function (s) { s.classList.add("visible"); });
  }

  /* ---------- 3. RIPPLE EFFECT ON BUTTONS ---------- */
  document.querySelectorAll("button, .btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      var rect = btn.getBoundingClientRect();
      var dot = document.createElement("span");
      dot.className = "ripple-dot";
      dot.style.left = (e.clientX - rect.left) + "px";
      dot.style.top = (e.clientY - rect.top) + "px";
      if (getComputedStyle(btn).position === "static") { btn.style.position = "relative"; }
      btn.style.overflow = "hidden";
      btn.appendChild(dot);
      setTimeout(function () { dot.remove(); }, 650);
    });
  });

  /* ---------- 4. INFORMATION CARDS (tab buttons) ---------- */
  var tabButtons = document.querySelectorAll(".tab-btn");
  var infoCards = document.querySelectorAll(".info-card");

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = document.getElementById(btn.dataset.target);
      if (!next || btn.classList.contains("active")) { return; }

      tabButtons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");

      // fade the old card out, then fade the new one in
      infoCards.forEach(function (card) {
        if (card.classList.contains("show")) {
          card.classList.remove("show");
          setTimeout(function () { card.classList.add("hidden"); }, 300);
        }
      });
      setTimeout(function () {
        next.classList.remove("hidden");
        void next.offsetWidth;            // force reflow so the transition runs
        next.classList.add("show");
      }, 320);
    });
  });

  /* ---------- 5. ACCORDION (open / close sections) ---------- */
  var accHeaders = document.querySelectorAll(".acc-header");
  accHeaders.forEach(function (header) {
    header.addEventListener("click", function () {
      var item = header.parentElement;
      var wasOpen = item.classList.contains("open");

      // close every other item first (one open at a time)
      document.querySelectorAll(".acc-item.open").forEach(function (o) {
        o.classList.remove("open");
        o.querySelector(".acc-header").setAttribute("aria-expanded", "false");
      });

      if (!wasOpen) {
        item.classList.toggle("open");
        header.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- 6. JOB QUICK-VIEW MODAL ---------- */
  var modal = document.getElementById("job-modal");
  var modalImg = document.getElementById("modal-img");
  var modalTitle = document.getElementById("modal-title");
  var modalMeta = document.getElementById("modal-meta");
  var modalSalary = document.getElementById("modal-salary");

  function openModal(card) {
    var headings = card.querySelectorAll("h4");
    var salary = "";
    headings.forEach(function (h) {
      if (h.textContent.trim() === "Salary") { salary = h.nextElementSibling.textContent; }
    });
    modalImg.src = card.querySelector("img").src;
    modalTitle.textContent = card.querySelector("header h3").textContent;
    modalMeta.textContent = card.querySelector("header p").textContent;
    modalSalary.textContent = salary;
    modal.classList.remove("closing");
    modal.classList.add("open");
  }

  function closeModal() {
    modal.classList.add("closing");               // plays the pop-out animation
    setTimeout(function () {
      modal.classList.remove("open");
      modal.classList.remove("closing");
    }, 300);
  }

  document.querySelectorAll(".btn-quickview").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal(btn.closest("article"));
    });
  });
  document.querySelector(".modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) { closeModal(); } });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) { closeModal(); }
  });
  document.getElementById("modal-apply").addEventListener("click", function () {
    closeModal();
    setTimeout(function () {
      document.getElementById("apply").scrollIntoView({ behavior: "smooth" });
      showToast("Great choice! Fill in the form below to apply.", "info");
    }, 350);
  });

  /* ---------- 7. SAVE JOB / SUBSCRIBE BUTTONS ---------- */
  document.querySelectorAll(".btn-save").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var saved = btn.classList.toggle("btn-primary");
      btn.classList.toggle("btn-secondary", !saved);
      btn.textContent = saved ? "\u2605 Saved" : "\u2606 Save Job";
      showToast(saved ? "Job saved to your shortlist." : "Job removed from shortlist.", saved ? "success" : "info");
    });
  });

  var notifyBtn = document.getElementById("notify-btn");
  if (notifyBtn) {
    notifyBtn.addEventListener("click", function () {
      notifyBtn.classList.add("is-loading");
      setTimeout(function () {
        notifyBtn.classList.remove("is-loading");
        showToast("You will now receive job alerts by email.", "success");
      }, 1200);
    });
  }

  /* ---------- 8. APPLICATION FORM FEEDBACK ---------- */
  var form = document.getElementById("application-form");
  var submitBtn = form.querySelector("button[type='submit']");
  var errorShown = false;

  // invalid fields shake (invalid does not bubble, so use capture)
  form.addEventListener("invalid", function (e) {
    var field = e.target;
    field.classList.add("shake");
    setTimeout(function () { field.classList.remove("shake"); }, 500);
    if (!errorShown) {
      errorShown = true;
      showToast("Please check the highlighted fields.", "error");
      setTimeout(function () { errorShown = false; }, 3000);
    }
  }, true);

  form.addEventListener("submit", function (e) {
    e.preventDefault();                          // demo: no real server
    submitBtn.classList.add("is-loading");
    submitBtn.textContent = "Submitting";
    setTimeout(function () {
      submitBtn.classList.remove("is-loading");
      submitBtn.textContent = "Submit Application";
      showToast("Application submitted successfully!", "success");
      form.reset();
    }, 1600);
  });

  form.addEventListener("reset", function () {
    showToast("Form cleared.", "info");
  });

  /* ---------- 9. FLOATING APPLY BUTTON ---------- */
  document.querySelector(".fab-apply").addEventListener("click", function () {
    showToast("Taking you to the application form...", "info");
  });

  /* ---------- 10. JOB BOARD MANAGER (DOM manipulation) ---------- */
  var jobs = [
    { id: 1, title: "Software Developer", company: "Nexora Technologies",  location: "Coimbatore, Tamil Nadu", salary: "4,50,000 - 7,00,000" },
    { id: 2, title: "Data Analyst",       company: "FinSight Analytics",   location: "Bengaluru, Karnataka",   salary: "5,00,000 - 8,00,000" },
    { id: 3, title: "HR Executive",       company: "GreenLeaf Industries", location: "Chennai, Tamil Nadu",    salary: "3,60,000 - 5,00,000" },
    { id: 4, title: "Staff Nurse",        company: "CarePoint Hospitals",  location: "Madurai, Tamil Nadu",    salary: "3,00,000 - 4,20,000" }
  ];
  var nextJobId = 5;
  var editingId = null;                       // null = add mode, number = edit mode

  var jobList    = document.getElementById("job-list");
  var jobEmpty   = document.getElementById("job-empty");
  var jobCount   = document.getElementById("job-count");
  var mgSave     = document.getElementById("mg-save");
  var mgCancel   = document.getElementById("mg-cancel");
  var mgClear    = document.getElementById("mg-clear");
  var mgSearch   = document.getElementById("mg-search");
  var mgFormBox  = document.getElementById("manager-form");
  var mgFormHead = document.getElementById("manager-form-title");
  var mgFields = {
    title:    document.getElementById("mg-title"),
    company:  document.getElementById("mg-company"),
    location: document.getElementById("mg-location"),
    salary:   document.getElementById("mg-salary")
  };

  // DISPLAY: rebuild the visible list from the jobs array
  function renderJobs() {
    var term = mgSearch.value.trim().toLowerCase();
    jobList.innerHTML = "";                   // clear the old items

    var visible = jobs.filter(function (job) {
      return (job.title + " " + job.company + " " + job.location).toLowerCase().indexOf(term) !== -1;
    });

    visible.forEach(function (job) {
      var li = document.createElement("li");
      li.className = "job-item";
      li.setAttribute("data-id", job.id);
      if (job.id === editingId) { li.classList.add("editing"); }

      var info = document.createElement("div");
      info.className = "job-info";

      var title = document.createElement("span");
      title.className = "job-title";
      title.textContent = job.title;

      var meta = document.createElement("span");
      meta.className = "job-meta";
      meta.textContent = job.company + " | " + job.location;

      var pay = document.createElement("span");
      pay.className = "job-pay";
      pay.textContent = "₹" + job.salary + " per annum";

      info.appendChild(title);
      info.appendChild(meta);
      info.appendChild(pay);

      var actions = document.createElement("div");
      actions.className = "job-actions";

      var editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-secondary";
      editBtn.textContent = "Edit";
      editBtn.setAttribute("aria-label", "Edit " + job.title);
      editBtn.addEventListener("click", function () { startEdit(job.id); });

      var removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "btn btn-danger";
      removeBtn.textContent = "Remove";
      removeBtn.setAttribute("aria-label", "Remove " + job.title);
      removeBtn.addEventListener("click", function () { removeJob(job.id, li); });

      actions.appendChild(editBtn);
      actions.appendChild(removeBtn);
      li.appendChild(info);
      li.appendChild(actions);
      jobList.appendChild(li);
    });

    updateBoardState(visible.length);
  }

  // show the count and the "nothing here" message
  function updateBoardState(visibleCount) {
    jobCount.textContent = jobs.length;
    if (visibleCount === 0) {
      jobEmpty.innerHTML = jobs.length === 0
        ? "No vacancies left. Add one using the form."
        : "No vacancies match <strong>your search</strong>.";
      jobEmpty.classList.add("show");
    } else {
      jobEmpty.classList.remove("show");
    }
  }

  function resetForm() {
    Object.keys(mgFields).forEach(function (key) {
      mgFields[key].value = "";
      mgFields[key].removeAttribute("aria-invalid");
    });
    editingId = null;
    mgSave.textContent = "Add Vacancy";
    mgFormHead.textContent = "Add a Vacancy";
    mgFormBox.setAttribute("data-mode", "add");
    mgCancel.classList.remove("visible");
  }

  // ADD or MODIFY
  mgSave.addEventListener("click", function () {
    var values = {};
    var valid = true;
    Object.keys(mgFields).forEach(function (key) {
      var field = mgFields[key];
      values[key] = field.value.trim();
      if (!values[key]) {
        valid = false;
        field.setAttribute("aria-invalid", "true");
        field.classList.add("shake");
        setTimeout(function () { field.classList.remove("shake"); }, 500);
      } else {
        field.removeAttribute("aria-invalid");
      }
    });
    if (!valid) { showToast("Please fill in every field.", "error"); return; }

    if (editingId === null) {
      jobs.push({ id: nextJobId++, title: values.title, company: values.company,
                  location: values.location, salary: values.salary });
      showToast("\"" + values.title + "\" added to the job board.", "success");
    } else {
      var job = jobs.filter(function (j) { return j.id === editingId; })[0];
      job.title = values.title;
      job.company = values.company;
      job.location = values.location;
      job.salary = values.salary;
      showToast("\"" + values.title + "\" updated.", "info");
    }
    resetForm();
    mgSearch.value = "";
    renderJobs();
  });

  // MODIFY: load a vacancy into the form
  function startEdit(id) {
    var job = jobs.filter(function (j) { return j.id === id; })[0];
    if (!job) { return; }
    editingId = id;
    mgFields.title.value = job.title;
    mgFields.company.value = job.company;
    mgFields.location.value = job.location;
    mgFields.salary.value = job.salary;
    mgSave.textContent = "Update Vacancy";
    mgFormHead.textContent = "Edit Vacancy";
    mgFormBox.setAttribute("data-mode", "edit");
    mgCancel.classList.add("visible");
    renderJobs();                              // highlights the item being edited
    mgFormBox.scrollIntoView({ behavior: "smooth", block: "center" });
    mgFields.title.focus();
  }

  mgCancel.addEventListener("click", function () {
    resetForm();
    renderJobs();
    showToast("Edit cancelled.", "info");
  });

  // REMOVE one vacancy
  function removeJob(id, li) {
    li.classList.add("removing");              // plays the slide-out animation first
    setTimeout(function () {
      jobs = jobs.filter(function (j) { return j.id !== id; });
      li.remove();
      if (editingId === id) { resetForm(); }
      renderJobs();
      showToast("Vacancy removed.", "info");
    }, 350);
  }

  // REMOVE ALL vacancies
  mgClear.addEventListener("click", function () {
    if (jobs.length === 0) { showToast("The job board is already empty.", "info"); return; }
    jobs = [];
    resetForm();
    renderJobs();
    showToast("All vacancies removed.", "info");
  });

  // live search while typing
  mgSearch.addEventListener("input", renderJobs);

  resetForm();
  renderJobs();

  /* welcome message shortly after page load */
  setTimeout(function () {
    showToast("Welcome to TalentBridge! 4 new vacancies are open.", "info");
  }, 1200);
});