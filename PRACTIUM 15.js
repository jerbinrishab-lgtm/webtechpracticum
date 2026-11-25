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

  /* ---------- 8. APPLICATION FORM VALIDATION ---------- */
  var form = document.getElementById("application-form");
  var submitBtn = form.querySelector("button[type='submit']");
  var summaryBox = document.getElementById("form-summary");
  var successBox = document.getElementById("form-success");
  var controls = form.querySelectorAll("input, select, textarea");
  var errorBoxes = {};                         // one error <span> per field (or per radio/checkbox group)
  var programmaticReset = false;
  var MAX_FILE_MB = 2;

  // dates are limited relative to today (18+ applicants, joining date not in the past)
  function isoDate(d) {
    var m = ("0" + (d.getMonth() + 1)).slice(-2);
    var day = ("0" + d.getDate()).slice(-2);
    return d.getFullYear() + "-" + m + "-" + day;
  }
  var today = new Date();
  document.getElementById("dob").setAttribute("max", isoDate(new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())));
  document.getElementById("startdate").setAttribute("min", isoDate(today));

  function fieldKey(field) {
    return (field.type === "radio" || field.type === "checkbox") ? "group-" + field.name : field.id;
  }

  // create an error message <span> for every field that has rules
  controls.forEach(function (field) {
    var isChoice = field.type === "radio" || field.type === "checkbox";
    var key = fieldKey(field);
    if (errorBoxes[key]) { return; }
    if (isChoice) {                            // only groups that are required need a message
      var group = form.querySelectorAll("[name='" + field.name + "']");
      var needed = Array.prototype.some.call(group, function (g) { return g.required; });
      if (!needed) { return; }
    }
    var box = document.createElement("span");
    box.className = "field-error";
    box.id = "err-" + key;
    box.setAttribute("aria-live", "polite");
    if (isChoice) {
      field.parentElement.appendChild(box);
    } else {
      field.insertAdjacentElement("afterend", box);
      field.setAttribute("aria-describedby", box.id);
    }
    errorBoxes[key] = box;
  });

  // extra rules that HTML attributes cannot express, using setCustomValidity()
  function applyCustomRules(field) {
    field.setCustomValidity("");               // always clear the old custom message first
    var id = field.id;

    if (id === "password") {
      var user = document.getElementById("username").value.trim().toLowerCase();
      if (user.length >= 4 && field.value.toLowerCase().indexOf(user) !== -1) {
        field.setCustomValidity("Your password must not contain your username.");
      }
    }
    if (id === "fullname" && field.value.trim() && field.value.trim().split(/\s+/).length < 2) {
      field.setCustomValidity("Please enter your first and last name.");
    }
    if (field.type === "file" && field.files) {
      var limit = (id === "photo" ? 1 : MAX_FILE_MB) * 1024 * 1024;
      if (id === "certificates" && field.files.length > 5) {
        field.setCustomValidity("You can upload a maximum of 5 certificates.");
      }
      Array.prototype.forEach.call(field.files, function (file) {
        if (file.size > limit) {
          field.setCustomValidity("\"" + file.name + "\" is larger than " + (limit / 1048576) + " MB.");
        }
      });
    }
  }

  // turn the browser's validity state into a friendly sentence
  function getMessage(field) {
    var v = field.validity;
    var label = field.id === "dob" ? "date of birth" : "value";
    if (v.valueMissing) {
      if (field.type === "checkbox") { return "You must accept this declaration to continue."; }
      if (field.type === "radio")    { return "Please choose one option."; }
      if (field.tagName === "SELECT") { return "Please select an option from the list."; }
      if (field.type === "file")     { return "Please choose a file to upload."; }
      return "This field is required.";
    }
    if (v.typeMismatch)    { return "Please enter a valid email address, e.g. name@example.com."; }
    if (v.tooShort)        { return "Enter at least " + field.minLength + " characters (you typed " + field.value.length + ")."; }
    if (v.tooLong)         { return "Enter no more than " + field.maxLength + " characters."; }
    if (v.patternMismatch) { return field.title || "The format of this value is not valid."; }
    if (v.rangeUnderflow)  {
      return field.type === "date" ? "Please choose a date on or after " + field.min + "." : "Enter a " + label + " of at least " + field.min + ".";
    }
    if (v.rangeOverflow)   {
      if (field.id === "dob") { return "You must be at least 18 years old to apply."; }
      return "Enter a " + label + " of at most " + field.max + ".";
    }
    if (v.stepMismatch)    { return "Please enter a valid amount (multiples of " + field.step + ")."; }
    if (v.badInput)        { return "Please enter a valid value."; }
    if (v.customError)     { return field.validationMessage; }
    return "Please check this field.";
  }

  // validate one field, then show or clear its message
  function validateField(field) {
    applyCustomRules(field);
    var valid = field.checkValidity();
    var box = errorBoxes[fieldKey(field)];
    if (box) { box.textContent = valid ? "" : getMessage(field); }
    return valid;
  }

  function clearValidationState() {
    controls.forEach(function (field) {
      field.setCustomValidity("");
      field.classList.remove("touched");
    });
    Object.keys(errorBoxes).forEach(function (key) { errorBoxes[key].textContent = ""; });
    summaryBox.textContent = "";
    summaryBox.classList.remove("show");
  }

  // live feedback: validate when leaving a field, then keep checking while typing
  controls.forEach(function (field) {
    field.addEventListener("blur", function () {
      field.classList.add("touched");
      validateField(field);
    });
    ["input", "change"].forEach(function (evt) {
      field.addEventListener(evt, function () {
        if (field.classList.contains("touched") || errorBoxes[fieldKey(field)] && errorBoxes[fieldKey(field)].textContent) {
          field.classList.add("touched");
          validateField(field);
        }
        // the password rule depends on the username, so re-check it too
        if (field.id === "username") {
          var pw = document.getElementById("password");
          if (pw.classList.contains("touched")) { validateField(pw); }
        }
      });
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();                        // never reload the page

    var firstInvalid = null;
    var invalidKeys = {};
    controls.forEach(function (field) {
      field.classList.add("touched");
      if (!validateField(field)) {
        invalidKeys[fieldKey(field)] = true;
        if (!firstInvalid) { firstInvalid = field; }
      }
    });

    var count = Object.keys(invalidKeys).length;
    if (count > 0) {
      summaryBox.textContent = count + (count === 1 ? " field needs" : " fields need") +
        " your attention. Please correct the highlighted fields and submit again.";
      summaryBox.classList.remove("show");
      void summaryBox.offsetWidth;             // restart the shake animation
      summaryBox.classList.add("show");
      showToast("Please correct the highlighted fields.", "error");
      firstInvalid.focus();
      firstInvalid.reportValidity();           // browser bubble on the first problem
      return;
    }

    // all fields are valid: simulate sending the application
    summaryBox.classList.remove("show");
    submitBtn.classList.add("is-loading");
    submitBtn.textContent = "Submitting";

    var positionSelect = document.getElementById("position");
    var applicantName = document.getElementById("fullname").value.trim();
    var positionName = positionSelect.options[positionSelect.selectedIndex].text;

    setTimeout(function () {
      submitBtn.classList.remove("is-loading");
      submitBtn.textContent = "Submit Application";

      document.getElementById("success-name").textContent = applicantName;
      document.getElementById("success-position").textContent = positionName;
      document.getElementById("success-ref").textContent = "TB-APP-" + Math.floor(100000 + Math.random() * 900000);

      programmaticReset = true;
      form.reset();
      programmaticReset = false;
      clearValidationState();

      successBox.classList.remove("show");
      void successBox.offsetWidth;
      successBox.classList.add("show");
      successBox.scrollIntoView({ behavior: "smooth", block: "center" });
      successBox.focus({ preventScroll: true });
      showToast("Application submitted successfully!", "success");
    }, 1400);
  });

  document.getElementById("success-another").addEventListener("click", function () {
    successBox.classList.remove("show");
    document.getElementById("username").focus();
  });

  form.addEventListener("reset", function () {
    setTimeout(clearValidationState, 0);       // wait until the browser has emptied the fields
    if (!programmaticReset) {
      successBox.classList.remove("show");
      showToast("Form cleared.", "info");
    }
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

  /* ---------- 11. LIVE JOBS (fetch API integration) ---------- */
  var API_URL = "https://remotive.com/api/remote-jobs";
  var API_LIMIT = 10;
  var API_TIMEOUT_MS = 10000;

  var apiCategory   = document.getElementById("api-category");
  var apiLoadBtn    = document.getElementById("api-load");
  var apiClearBtn   = document.getElementById("api-clear");
  var apiRetryBtn   = document.getElementById("api-retry");
  var apiStatus     = document.getElementById("api-status");
  var apiStatusText = document.getElementById("api-status-text");
  var apiError      = document.getElementById("api-error");
  var apiErrorText  = document.getElementById("api-error-text");
  var apiTableWrap  = document.getElementById("api-table-wrap");
  var apiCaption    = document.getElementById("api-caption");
  var apiBody       = document.getElementById("api-body");
  var apiMeta       = document.getElementById("api-meta");
  var apiCache      = {};                      // remembers results so the API is not called twice for one industry

  function showLoading(on, message) {
    apiStatus.classList.toggle("show", on);
    apiStatusText.textContent = message || "Loading jobs...";
    apiLoadBtn.disabled = on;
    apiLoadBtn.classList.toggle("is-loading", on);
    apiTableWrap.setAttribute("aria-busy", on ? "true" : "false");
  }

  function showError(message) {
    apiErrorText.textContent = message;
    apiError.classList.add("show");
  }

  function hideError() {
    apiError.classList.remove("show");
    apiErrorText.textContent = "";
  }

  function clearResults() {
    apiBody.textContent = "";                  // removes every row
    apiTableWrap.classList.remove("show");
    apiMeta.textContent = "";
  }

  // build one table cell
  function makeCell(text, className) {
    var td = document.createElement("td");
    td.textContent = text;
    if (className) { td.className = className; }
    return td;
  }

  // PRESENT: turn the JSON array into table rows
  function renderApiJobs(jobs, total, label) {
    clearResults();

    jobs.forEach(function (job, index) {
      var tr = document.createElement("tr");
      tr.style.animationDelay = (index * 60) + "ms";

      tr.appendChild(makeCell(job.title || "Untitled role", "api-title"));
      tr.appendChild(makeCell(job.company_name || "Not stated"));

      var typeCell = document.createElement("td");
      var badge = document.createElement("span");
      badge.className = "api-badge";
      badge.textContent = (job.job_type || "n/a").replace(/_/g, " ");
      typeCell.appendChild(badge);
      tr.appendChild(typeCell);

      tr.appendChild(makeCell(job.candidate_required_location || "Anywhere"));
      tr.appendChild(makeCell(job.salary ? job.salary : "Not disclosed"));

      var posted = new Date(job.publication_date);
      tr.appendChild(makeCell(isNaN(posted) ? "-" :
        posted.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })));

      var linkCell = document.createElement("td");
      if (typeof job.url === "string" && job.url.indexOf("https://") === 0) {
        var link = document.createElement("a");
        link.href = job.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View Job";
        linkCell.appendChild(link);
      } else {
        linkCell.textContent = "-";
      }
      tr.appendChild(linkCell);

      apiBody.appendChild(tr);
    });

    apiCaption.textContent = label + " - latest openings received from the API";
    apiMeta.textContent = "Showing " + jobs.length + " of " + total +
      " jobs. Source: Remotive (listings are delayed by 24 hours). Select \"View Job\" to open the original posting.";
    apiTableWrap.classList.add("show");
  }

  // FETCH: async function using try / catch / finally
  async function loadJobs() {
    var slug = apiCategory.value;
    var label = apiCategory.options[apiCategory.selectedIndex].text;

    hideError();
    clearResults();
    showLoading(true, "Fetching " + label + " jobs...");

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, API_TIMEOUT_MS);

    try {
      var data;
      if (apiCache[slug]) {
        data = apiCache[slug];                 // no new network call
      } else {
        var response = await fetch(API_URL + "?category=" + encodeURIComponent(slug) + "&limit=" + API_LIMIT,
                                   { signal: controller.signal });
        if (!response.ok) {
          throw new Error("The server answered with status " + response.status + ".");
        }
        data = await response.json();
        if (!data || !Array.isArray(data.jobs)) {
          throw new Error("The data received was not in the expected format.");
        }
        apiCache[slug] = data;
      }

      if (data.jobs.length === 0) {
        showError("No openings were found for " + label + " right now. Please try another industry.");
        return;
      }

      var total = typeof data["job-count"] === "number" ? data["job-count"] : data.jobs.length;
      renderApiJobs(data.jobs.slice(0, API_LIMIT), total, label);
      showToast(data.jobs.length + " " + label + " jobs loaded.", "success");
    } catch (err) {
      if (err.name === "AbortError") {
        showError("The request took too long and was cancelled. Please check your connection and try again.");
      } else if (err instanceof TypeError) {
        showError("Could not reach the jobs service. Check your internet connection and try again.");
      } else {
        showError(err.message);
      }
      showToast("Could not load jobs.", "error");
    } finally {
      clearTimeout(timer);
      showLoading(false);                      // always runs: hides the spinner and re-enables the button
    }
  }

  apiLoadBtn.addEventListener("click", loadJobs);
  apiRetryBtn.addEventListener("click", loadJobs);
  apiClearBtn.addEventListener("click", function () {
    hideError();
    clearResults();
    showToast("Results cleared.", "info");
  });

  /* ---------- 12. RECRUITER TASK MANAGER (CRUD + localStorage) ---------- */
  var TASK_KEY = "talentbridge_tasks";
  var tasks = [];                              // the data: every task is an object in this array
  var taskEditId = null;                       // null = create mode, a number = update mode

  var taskForm     = document.getElementById("task-form");
  var taskFormHead = document.getElementById("task-form-title");
  var taskSaveBtn  = document.getElementById("tk-save");
  var taskCancel   = document.getElementById("tk-cancel");
  var taskFilter   = document.getElementById("tk-filter");
  var taskClearBtn = document.getElementById("tk-clear-done");
  var taskBody     = document.getElementById("task-body");
  var taskEmpty    = document.getElementById("task-empty");
  var taskTable    = document.getElementById("task-table");
  var tkTitle      = document.getElementById("tk-title");
  var tkPosition   = document.getElementById("tk-position");
  var tkPriority   = document.getElementById("tk-priority");
  var tkDue        = document.getElementById("tk-due");
  var tkStatus     = document.getElementById("tk-status");
  var tkNotes      = document.getElementById("tk-notes");

  var STATUS_LABELS = { todo: "To Do", inprogress: "In Progress", done: "Done" };

  function dayOffset(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return isoDate(d);
  }

  // STORAGE: read the saved tasks (returns null when nothing valid is saved yet)
  function loadTasks() {
    try {
      var raw = localStorage.getItem(TASK_KEY);
      if (raw === null) { return null; }
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch (err) {
      return null;                             // blocked storage or damaged data
    }
  }

  // STORAGE: write the whole array back after every change
  function saveTasks() {
    try {
      localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
    } catch (err) {
      showToast("This browser could not save your tasks. They will be lost on refresh.", "error");
    }
  }

  function nextTaskId() {
    return tasks.reduce(function (max, t) { return Math.max(max, t.id); }, 0) + 1;
  }

  // first visit: start with a few sample tasks
  var storedTasks = loadTasks();
  if (storedTasks) {
    tasks = storedTasks;
  } else {
    tasks.push({ id: 1, title: "Screen applicants for Software Developer", position: "TB-101 - Software Developer",
                 priority: "high", due: dayOffset(2), status: "inprogress", notes: "Shortlist the top 5 resumes." });
    tasks.push({ id: 2, title: "Schedule interviews for Staff Nurse", position: "TB-104 - Staff Nurse",
                 priority: "high", due: dayOffset(1), status: "todo", notes: "Confirm slots with CarePoint Hospitals." });
    tasks.push({ id: 3, title: "Send offer letter to HR Executive finalist", position: "TB-103 - HR Executive",
                 priority: "medium", due: dayOffset(5), status: "todo", notes: "" });
    tasks.push({ id: 4, title: "Update the Data Analyst job description", position: "TB-102 - Data Analyst",
                 priority: "low", due: dayOffset(-1), status: "done", notes: "Added Power BI to the skills list." });
    saveTasks();
  }

  function makeTaskCell(className) {
    var td = document.createElement("td");
    if (className) { td.className = className; }
    return td;
  }

  function formatDue(due) {
    var d = new Date(due + "T00:00:00");
    return isNaN(d) ? "-" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  // READ: show the counters
  function updateTaskStats() {
    document.getElementById("stat-total").textContent = tasks.length;
    Object.keys(STATUS_LABELS).forEach(function (key) {
      document.getElementById("stat-" + key).textContent =
        tasks.filter(function (t) { return t.status === key; }).length;
    });
  }

  // READ: rebuild the table from the tasks array
  function renderTasks() {
    var filter = taskFilter.value;
    var todayIso = isoDate(new Date());
    taskBody.textContent = "";

    var visible = tasks.filter(function (t) { return filter === "all" || t.status === filter; });
    visible.sort(function (a, b) {             // earliest due date first, tasks without a date last
      if (!a.due && !b.due) { return a.id - b.id; }
      if (!a.due) { return 1; }
      if (!b.due) { return -1; }
      return a.due < b.due ? -1 : a.due > b.due ? 1 : a.id - b.id;
    });

    visible.forEach(function (task) {
      var overdue = task.due && task.due < todayIso && task.status !== "done";
      var tr = document.createElement("tr");
      tr.className = "task-row" + (task.status === "done" ? " is-done" : "") + (overdue ? " is-overdue" : "");
      tr.setAttribute("data-id", task.id);
      if (task.id === taskEditId) { tr.classList.add("editing"); }

      // task title + notes
      var titleCell = makeTaskCell("task-name");
      var title = document.createElement("span");
      title.className = "task-title";
      title.textContent = task.title;
      titleCell.appendChild(title);
      if (task.notes) {
        var notes = document.createElement("span");
        notes.className = "task-notes";
        notes.textContent = task.notes;
        titleCell.appendChild(notes);
      }
      tr.appendChild(titleCell);

      // position
      var posCell = makeTaskCell();
      posCell.textContent = task.position;
      tr.appendChild(posCell);

      // priority badge
      var priCell = makeTaskCell();
      var pri = document.createElement("span");
      pri.className = "task-badge priority-" + task.priority;
      pri.textContent = task.priority;
      priCell.appendChild(pri);
      tr.appendChild(priCell);

      // due date
      var dueCell = makeTaskCell("task-due");
      dueCell.textContent = task.due ? formatDue(task.due) : "No date";
      if (overdue) {
        var late = document.createElement("span");
        late.className = "task-late";
        late.textContent = "Overdue";
        dueCell.appendChild(late);
      }
      tr.appendChild(dueCell);

      // UPDATE STATUS: a drop-down inside the row
      var statusCell = makeTaskCell();
      var select = document.createElement("select");
      select.className = "task-status-select";
      select.setAttribute("data-status", task.status);
      select.setAttribute("aria-label", "Status of " + task.title);
      Object.keys(STATUS_LABELS).forEach(function (key) {
        var option = document.createElement("option");
        option.value = key;
        option.textContent = STATUS_LABELS[key];
        if (key === task.status) { option.selected = true; }
        select.appendChild(option);
      });
      select.addEventListener("change", function () {
        var target = tasks.find(function (t) { return t.id === task.id; });
        if (!target) { return; }
        target.status = select.value;
        saveTasks();
        renderTasks();
        showToast("\"" + target.title + "\" marked " + STATUS_LABELS[target.status] + ".", "info");
      });
      statusCell.appendChild(select);
      tr.appendChild(statusCell);

      // actions
      var actionCell = makeTaskCell("task-actions");
      var editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-secondary";
      editBtn.textContent = "Edit";
      editBtn.setAttribute("aria-label", "Edit " + task.title);
      editBtn.addEventListener("click", function () { startTaskEdit(task.id); });

      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn btn-danger";
      delBtn.textContent = "Delete";
      delBtn.setAttribute("aria-label", "Delete " + task.title);
      delBtn.addEventListener("click", function () { deleteTask(task.id, tr); });

      actionCell.appendChild(editBtn);
      actionCell.appendChild(delBtn);
      tr.appendChild(actionCell);

      taskBody.appendChild(tr);
    });

    taskTable.style.display = visible.length ? "" : "none";
    taskEmpty.classList.toggle("show", visible.length === 0);
    taskEmpty.textContent = tasks.length === 0
      ? "No tasks yet. Add your first task using the form."
      : "No tasks match this filter.";
    updateTaskStats();
  }

  function resetTaskForm() {
    taskForm.reset();
    taskEditId = null;
    taskSaveBtn.textContent = "Add Task";
    taskFormHead.textContent = "Add a Task";
    taskForm.setAttribute("data-mode", "add");
    taskCancel.classList.remove("visible");
  }

  // CREATE and UPDATE
  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var title = tkTitle.value.trim();
    if (title.length < 3) {
      tkTitle.classList.add("shake");
      setTimeout(function () { tkTitle.classList.remove("shake"); }, 500);
      showToast("Please enter a task of at least 3 characters.", "error");
      return;
    }

    if (taskEditId === null) {
      tasks.push({ id: nextTaskId(), title: title, position: tkPosition.value, priority: tkPriority.value,
                   due: tkDue.value, status: tkStatus.value, notes: tkNotes.value.trim() });
      showToast("Task added.", "success");
    } else {
      var task = tasks.find(function (t) { return t.id === taskEditId; });
      if (task) {
        task.title = title;
        task.position = tkPosition.value;
        task.priority = tkPriority.value;
        task.due = tkDue.value;
        task.status = tkStatus.value;
        task.notes = tkNotes.value.trim();
        showToast("Task updated.", "info");
      }
    }
    saveTasks();
    resetTaskForm();
    renderTasks();
  });

  // UPDATE: load a task into the form
  function startTaskEdit(id) {
    var task = tasks.find(function (t) { return t.id === id; });
    if (!task) { return; }
    taskEditId = id;
    tkTitle.value = task.title;
    tkPosition.value = task.position;
    tkPriority.value = task.priority;
    tkDue.value = task.due;
    tkStatus.value = task.status;
    tkNotes.value = task.notes;
    taskSaveBtn.textContent = "Update Task";
    taskFormHead.textContent = "Edit Task";
    taskForm.setAttribute("data-mode", "edit");
    taskCancel.classList.add("visible");
    renderTasks();                             // highlights the row being edited
    taskForm.scrollIntoView({ behavior: "smooth", block: "center" });
    tkTitle.focus();
  }

  taskCancel.addEventListener("click", function () {
    resetTaskForm();
    renderTasks();
    showToast("Edit cancelled.", "info");
  });

  // DELETE one task
  function deleteTask(id, row) {
    row.classList.add("removing");             // slide-out animation first
    setTimeout(function () {
      tasks = tasks.filter(function (t) { return t.id !== id; });
      saveTasks();
      row.remove();
      if (taskEditId === id) { resetTaskForm(); }
      renderTasks();
      showToast("Task deleted.", "info");
    }, 350);
  }

  // DELETE all completed tasks
  taskClearBtn.addEventListener("click", function () {
    var before = tasks.length;
    tasks = tasks.filter(function (t) { return t.status !== "done"; });
    if (tasks.length === before) { showToast("There are no completed tasks to delete.", "info"); return; }
    saveTasks();
    if (taskEditId !== null && !tasks.some(function (t) { return t.id === taskEditId; })) { resetTaskForm(); }
    renderTasks();
    showToast((before - tasks.length) + " completed task(s) deleted.", "success");
  });

  taskFilter.addEventListener("change", renderTasks);

  resetTaskForm();
  renderTasks();

  /* ---------- 13. JOB EXPLORER (search, filter, sort, compare) ---------- */
  var exJobs = [
    { id: 1, title: "Software Developer",     company: "Nexora Technologies", location: "Coimbatore, Tamil Nadu", industry: "Technology",
      level: "entry",  min: 4.5, max: 7,  skills: ["HTML, CSS and JavaScript", "Java or Python", "SQL basics", "Git"],
      eligibility: "B.E./B.Tech in CSE or IT. Freshers welcome." },
    { id: 2, title: "Data Analyst",           company: "FinSight Analytics",  location: "Bengaluru, Karnataka",   industry: "Finance",
      level: "entry",  min: 5,   max: 8,  skills: ["Advanced Excel and SQL", "Python (pandas) or R", "Power BI or Tableau"],
      eligibility: "Any graduate degree, Maths or Statistics preferred. 1-3 years." },
    { id: 3, title: "HR Executive",           company: "GreenLeaf Industries", location: "Chennai, Tamil Nadu",   industry: "Human Resources",
      level: "entry",  min: 3.6, max: 5,  skills: ["Talent sourcing", "Knowledge of labour laws", "HRMS tools"],
      eligibility: "MBA (HR) with 1-2 years of HR experience." },
    { id: 4, title: "Staff Nurse",            company: "CarePoint Hospitals", location: "Madurai, Tamil Nadu",    industry: "Healthcare",
      level: "entry",  min: 3,   max: 4.2, skills: ["Patient assessment", "Life support (BLS/ACLS)", "Teamwork"],
      eligibility: "B.Sc Nursing or GNM with valid council registration." },
    { id: 5, title: "Production Supervisor",  company: "Precision Works",     location: "Hosur, Tamil Nadu",      industry: "Manufacturing",
      level: "mid",    min: 4.8, max: 7.2, skills: ["Shop-floor management", "Lean and 5S", "Safety compliance"],
      eligibility: "Diploma or B.E. (Mechanical) with 3-5 years in production." },
    { id: 6, title: "Logistics Coordinator",  company: "SwiftRoute Logistics", location: "Coimbatore, Tamil Nadu", industry: "Logistics",
      level: "mid",    min: 3.6, max: 5.5, skills: ["Route planning", "Inventory software", "Vendor coordination"],
      eligibility: "Any graduate with 2-4 years in supply chain." },
    { id: 7, title: "Senior Software Engineer", company: "Nexora Technologies", location: "Bengaluru, Karnataka", industry: "Technology",
      level: "senior", min: 14,  max: 22, skills: ["System design", "Cloud (AWS or Azure)", "Mentoring", "Java or Python"],
      eligibility: "B.E./B.Tech with 6+ years of product experience." },
    { id: 8, title: "Senior Accountant",      company: "Ledgerline Advisors", location: "Chennai, Tamil Nadu",    industry: "Finance",
      level: "mid",    min: 6,   max: 9,  skills: ["GST and TDS filing", "Tally and Excel", "Audit support"],
      eligibility: "B.Com/M.Com or CA Inter with 3-5 years." }
  ];

  var EX_LEVELS = { entry: "Entry (0-2 yrs)", mid: "Mid (2-5 yrs)", senior: "Senior (5+ yrs)" };
  var EX_STYLES = {
    "Technology":      { color: "#1f4e79", glyph: "&lt;/&gt;" },
    "Finance":         { color: "#2e75b6", glyph: "₹" },
    "Healthcare":      { color: "#c0392b", glyph: "+" },
    "Human Resources": { color: "#5b8fc4", glyph: "HR" },
    "Manufacturing":   { color: "#12345a", glyph: "MFG" },
    "Logistics":       { color: "#d68910", glyph: "LOG" }
  };

  var exSearch    = document.querySelector("#ex-search");
  var exIndustry  = document.querySelector("#ex-industry");
  var exLevel     = document.querySelector("#ex-level");
  var exSort      = document.querySelector("#ex-sort");
  var exList      = document.querySelector("#ex-list");
  var exCount     = document.querySelector("#ex-count");
  var exEmpty     = document.querySelector("#ex-empty");
  var exToggleAll = document.querySelector("#ex-toggle-all");
  var exReset     = document.querySelector("#ex-reset");
  var exCompare   = document.querySelector("#ex-compare");
  var exCompareBody = document.querySelector("#ex-compare-body");
  var exCompareClear = document.querySelector("#ex-compare-clear");
  var exSelected  = [];                        // ids of the jobs chosen for comparison (maximum two)

  function makeEl(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  }

  function exSalary(job) { return "₹" + job.min + " - " + job.max + " LPA"; }

  function exIcon(industry) {
    var st = EX_STYLES[industry];
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='12' fill='" +
      st.color + "'/><text x='32' y='40' font-size='20' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold'>" +
      st.glyph + "</text></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  // FILTER + SORT: returns the jobs that match the controls
  function getExplorerJobs() {
    var term = exSearch.value.trim().toLowerCase();
    var industry = exIndustry.value;
    var level = exLevel.value;

    var result = exJobs.filter(function (job) {
      var text = (job.title + " " + job.company + " " + job.location + " " + job.skills.join(" ")).toLowerCase();
      return (term === "" || text.indexOf(term) !== -1) &&
             (industry === "all" || job.industry === industry) &&
             (level === "all" || job.level === level);
    });

    if (exSort.value === "high") { result.sort(function (a, b) { return b.max - a.max; }); }
    if (exSort.value === "low")  { result.sort(function (a, b) { return a.min - b.min; }); }
    return result;
  }

  // DISPLAY: build one card per job
  function renderExplorer() {
    var jobs = getExplorerJobs();
    exList.textContent = "";

    jobs.forEach(function (job, index) {
      var li = makeEl("li", "ex-card");
      li.style.animationDelay = (index * 50) + "ms";
      li.setAttribute("data-id", job.id);
      li.classList.toggle("selected", exSelected.indexOf(job.id) !== -1);

      var icon = makeEl("img", "ex-icon");
      icon.src = exIcon(job.industry);
      icon.alt = job.industry + " industry icon";
      icon.width = 64;
      icon.height = 64;

      var head = makeEl("div", "ex-head");
      head.appendChild(makeEl("h3", "ex-title", job.title));
      head.appendChild(makeEl("p", "ex-meta", job.company + " | " + job.location));

      var top = makeEl("div", "ex-top");
      top.appendChild(icon);
      top.appendChild(head);

      var tags = makeEl("div", "ex-tags");
      tags.appendChild(makeEl("span", "ex-tag", job.industry));
      tags.appendChild(makeEl("span", "ex-tag ex-level", EX_LEVELS[job.level]));

      var details = document.createElement("details");
      details.appendChild(makeEl("summary", "", "Skills and eligibility"));
      var skillList = makeEl("ul", "ex-skills");
      job.skills.forEach(function (skill) { skillList.appendChild(makeEl("li", "", skill)); });
      details.appendChild(skillList);
      details.appendChild(makeEl("p", "ex-eligibility", job.eligibility));

      var footer = makeEl("div", "ex-footer");
      footer.appendChild(makeEl("span", "ex-salary", exSalary(job)));
      var compareBtn = makeEl("button", "btn btn-secondary ex-compare-btn");
      compareBtn.type = "button";
      compareBtn.textContent = li.classList.contains("selected") ? "Selected" : "Compare";
      compareBtn.addEventListener("click", function () { toggleCompare(job.id, li, compareBtn); });
      footer.appendChild(compareBtn);

      li.appendChild(top);
      li.appendChild(tags);
      li.appendChild(details);
      li.appendChild(footer);
      exList.appendChild(li);
    });

    exCount.textContent = "Showing " + jobs.length + " of " + exJobs.length + " jobs";
    exEmpty.classList.toggle("show", jobs.length === 0);
    exToggleAll.textContent = "Expand All Details";
    exToggleAll.classList.remove("active");
  }

  // COMPARE: choose up to two jobs
  function toggleCompare(id, li, btn) {
    var position = exSelected.indexOf(id);
    if (position !== -1) {
      exSelected.splice(position, 1);
      li.classList.remove("selected");
      btn.textContent = "Compare";
    } else {
      if (exSelected.length >= 2) {
        showToast("You can compare two jobs at a time. Remove one first.", "info");
        return;
      }
      exSelected.push(id);
      li.classList.add("selected");
      btn.textContent = "Selected";
    }
    updateComparison();
  }

  function updateComparison() {
    exCompareBody.textContent = "";
    exCompare.classList.toggle("show", exSelected.length > 0);
    if (exSelected.length === 0) { return; }

    if (exSelected.length === 1) {
      exCompareBody.appendChild(makeEl("p", "ex-hint", "Select one more job to compare it with this one."));
      return;
    }

    var a = exJobs.find(function (j) { return j.id === exSelected[0]; });
    var b = exJobs.find(function (j) { return j.id === exSelected[1]; });
    var rows = [
      { label: "Job",        left: a.title,                right: b.title },
      { label: "Company",    left: a.company,              right: b.company },
      { label: "Location",   left: a.location,             right: b.location },
      { label: "Industry",   left: a.industry,             right: b.industry },
      { label: "Experience", left: EX_LEVELS[a.level],     right: EX_LEVELS[b.level] },
      { label: "Salary",     left: exSalary(a),            right: exSalary(b),
        better: a.max === b.max ? "" : (a.max > b.max ? "left" : "right") },
      { label: "Skills",     left: a.skills.join(", "),    right: b.skills.join(", ") }
    ];

    rows.forEach(function (row) {
      var line = makeEl("div", "ex-row");
      line.appendChild(makeEl("span", "ex-row-label", row.label));
      var left = makeEl("span", "ex-row-cell", row.left);
      var right = makeEl("span", "ex-row-cell", row.right);
      if (row.better === "left")  { left.classList.add("better"); }
      if (row.better === "right") { right.classList.add("better"); }
      line.appendChild(left);
      line.appendChild(right);
      exCompareBody.appendChild(line);
    });
  }

  // controls
  exSearch.addEventListener("input", renderExplorer);
  [exIndustry, exLevel, exSort].forEach(function (control) {
    control.addEventListener("change", renderExplorer);
  });

  exReset.addEventListener("click", function () {
    exSearch.value = "";
    exIndustry.value = "all";
    exLevel.value = "all";
    exSort.value = "default";
    renderExplorer();
    showToast("Filters reset.", "info");
  });

  // expand or collapse every card's <details>
  exToggleAll.addEventListener("click", function () {
    var open = exToggleAll.classList.toggle("active");
    document.querySelectorAll("#ex-list .ex-card details").forEach(function (d) { d.open = open; });
    exToggleAll.textContent = open ? "Collapse All Details" : "Expand All Details";
  });

  exCompareClear.addEventListener("click", function () {
    exSelected = [];
    document.querySelectorAll("#ex-list .ex-card.selected").forEach(function (card) {
      card.classList.remove("selected");
      card.querySelector(".ex-compare-btn").textContent = "Compare";
    });
    updateComparison();
  });

  renderExplorer();

  /* ---------- 14. URGENT HIRING MODE (custom toggle + localStorage) ---------- */
  var URGENT_KEY = "talentbridge_urgent_mode";
  var urgentToggle  = document.getElementById("urgent-toggle");
  var urgentRow     = document.getElementById("urgent-row");
  var urgentState   = document.getElementById("urgent-state");
  var urgentSummary = document.getElementById("urgent-summary");

  // mark which vacancies are urgent: cards with a Hot / Urgent badge, and their matching table rows
  var jobCards = document.querySelectorAll("#job-details article");
  jobCards.forEach(function (card) {
    if (card.querySelector(".badge-hot, .badge-urgent")) {
      card.classList.add("is-urgent");
      document.querySelectorAll("#vacancies tbody a[href='#" + card.id + "']").forEach(function (link) {
        link.closest("tr").classList.add("is-urgent");
      });
    }
  });
  var urgentCount = document.querySelectorAll("#job-details article.is-urgent").length;

  // update the page to match the toggle state
  function applyUrgentMode(on) {
    document.body.classList.toggle("urgent-mode", on);
    urgentRow.classList.toggle("is-on", on);
    urgentToggle.setAttribute("aria-checked", on ? "true" : "false");
    urgentState.textContent = on ? "ON" : "OFF";
    urgentSummary.textContent = on
      ? "Urgent Hiring Mode is on: showing " + urgentCount + " of " + jobCards.length + " vacancies."
      : "Showing all " + jobCards.length + " vacancies.";
  }

  // LOCAL STORAGE: read the saved choice (defaults to off if nothing is saved or storage is blocked)
  function loadUrgentSetting() {
    try { return localStorage.getItem(URGENT_KEY) === "true"; }
    catch (err) { return false; }
  }
  // LOCAL STORAGE: save the choice
  function saveUrgentSetting(on) {
    try { localStorage.setItem(URGENT_KEY, on ? "true" : "false"); }
    catch (err) { showToast("This browser could not save your setting.", "error"); }
  }

  // restore the saved state on page load (no toast)
  urgentToggle.checked = loadUrgentSetting();
  applyUrgentMode(urgentToggle.checked);

  // react whenever the user flips the switch
  urgentToggle.addEventListener("change", function () {
    applyUrgentMode(urgentToggle.checked);
    saveUrgentSetting(urgentToggle.checked);
    showToast(urgentToggle.checked ? "Urgent Hiring Mode enabled." : "Urgent Hiring Mode disabled.",
              urgentToggle.checked ? "success" : "info");
  });

  /* welcome message shortly after page load */
  setTimeout(function () {
    showToast("Welcome to TalentBridge! 4 new vacancies are open.", "info");
  }, 1200);
});