(function () {
  'use strict';

  const STORAGE_KEY = 'msft-safety-learning-report-nocdn-v1';

  const sections = [
    { id: 'simulation', title: 'Simulation', sub: 'Activity context' },
    { id: 'reporter', title: 'Reporter', sub: 'Who is completing it' },
    { id: 'incident', title: 'Event details', sub: 'What happened' },
    { id: 'people', title: 'People involved', sub: 'Fictional details only' },
    { id: 'harm', title: 'Harm and risk', sub: 'Actual/potential impact' },
    { id: 'actions', title: 'Actions', sub: 'Immediate response' },
    { id: 'notifications', title: 'Escalation', sub: 'Who was informed' },
    { id: 'learning', title: 'Learning', sub: 'Factors and review' }
  ];

  const requiredFields = {
    simulationScenario: 'Simulation scenario/activity name',
    learnerName: 'Learner or group name',
    reporterName: 'Reporter name',
    reporterRole: 'Reporter role',
    incidentDateTime: 'Incident date/time',
    incidentType: 'Incident type',
    incidentTitle: 'Short title',
    description: 'Description of what happened',
    immediateActions: 'Immediate actions taken',
    currentSafetyStatus: 'Current safety status'
  };

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function nowDateTimeLocal() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function nowDateOnly() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function makeReference() {
    const d = new Date();
    const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `MSFT-SLR-${stamp}-${suffix}`;
  }

  function initialForm() {
    return {
      reference: makeReference(),
      status: 'Draft',
      reportedOn: nowDateTimeLocal(),
      simulationScenario: '',
      simulationPart: '',
      learnerName: '',
      facilitatorName: '',
      placementArea: 'Mary Seacole Simulation Suite',
      simulationNotes: '',
      reporterName: '',
      reporterRole: '',
      reporterEmail: '',
      reporterPhone: '',
      incidentDateTime: '',
      discoveredDateTime: '',
      location: 'Mary Seacole Simulation Suite',
      serviceArea: 'Simulation ward',
      incidentType: '',
      incidentTitle: '',
      description: '',
      personAffectedType: 'Patient / service user',
      patientInitials: '',
      patientIdentifier: '',
      ageGroup: '',
      staffInvolved: '',
      witnesses: '',
      externalAgencies: '',
      actualHarm: 'No harm',
      potentialHarm: 'Low',
      clinicalReviewRequired: 'No',
      treatmentRequired: '',
      immediateActions: '',
      currentSafetyStatus: '',
      informedNurseInCharge: false,
      informedManager: false,
      informedDoctor: false,
      informedSafeguarding: false,
      informedPharmacy: false,
      informedSecurityPolice: false,
      informedUniversityPEF: false,
      informedFamilyCarer: false,
      otherNotifications: '',
      dutyOfCandourConsidered: 'Not applicable / no notifiable harm identified',
      patientFamilyInformed: 'Not applicable',
      communicationNotes: '',
      factorsStaffing: false,
      factorsCommunication: false,
      factorsDocumentation: false,
      factorsEnvironment: false,
      factorsEquipment: false,
      factorsTraining: false,
      factorsPolicy: false,
      factorsPatient: false,
      factorsMedication: false,
      factorsHandover: false,
      otherFactors: '',
      reviewerName: '',
      reviewerRole: '',
      reviewOutcome: '',
      learningActions: '',
      actionOwner: '',
      targetDate: nowDateOnly(),
      facilitatorDebriefNotes: ''
    };
  }

  let state = {
    form: loadDraft() || initialForm(),
    activeSection: 'simulation',
    showIntro: !sessionStorage.getItem('msft-slr-intro-seen'),
    toast: '',
    query: ''
  };

  const fieldLabels = Object.assign({}, requiredFields, {
    reference: 'Reference',
    status: 'Status',
    reportedOn: 'Reported on',
    simulationPart: 'Part/station',
    facilitatorName: 'Facilitator name',
    placementArea: 'Simulation/placement area',
    simulationNotes: 'Simulation notes',
    reporterEmail: 'Reporter email',
    reporterPhone: 'Reporter phone',
    discoveredDateTime: 'Date/time discovered',
    location: 'Location',
    serviceArea: 'Service area',
    personAffectedType: 'Person affected',
    patientInitials: 'Fictional patient initials',
    patientIdentifier: 'Fictional identifier',
    ageGroup: 'Age group',
    staffInvolved: 'Staff/student involved',
    witnesses: 'Witnesses',
    externalAgencies: 'External agencies',
    actualHarm: 'Actual harm',
    potentialHarm: 'Potential harm',
    clinicalReviewRequired: 'Clinical review required',
    treatmentRequired: 'Treatment/support required',
    dutyOfCandourConsidered: 'Duty of candour considered',
    patientFamilyInformed: 'Patient/family informed',
    communicationNotes: 'Communication notes',
    otherNotifications: 'Other notifications',
    otherFactors: 'Other contributory factors',
    reviewerName: 'Reviewer name',
    reviewerRole: 'Reviewer role',
    reviewOutcome: 'Review outcome',
    learningActions: 'Learning actions',
    actionOwner: 'Action owner',
    targetDate: 'Target date',
    facilitatorDebriefNotes: 'Facilitator debrief notes'
  });

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveDraftSilent() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.form));
  }

  function showToast(message) {
    state.toast = message;
    render();
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      state.toast = '';
      render();
    }, 2800);
  }

  function fieldValue(name) {
    return state.form[name] == null ? '' : state.form[name];
  }

  function setField(name, value) {
    state.form[name] = value;
    if (state.form.status === 'Submitted for review') {
      state.form.status = 'Draft - amended after submission';
    }
    saveDraftSilent();
    renderSummaryOnly();
  }

  function setCheckbox(name, checked) {
    setField(name, checked);
  }

  function validate() {
    return Object.entries(requiredFields)
      .filter(([name]) => !String(fieldValue(name)).trim())
      .map(([, label]) => label);
  }

  function isSectionComplete(sectionId) {
    const f = state.form;
    if (sectionId === 'simulation') return f.simulationScenario.trim() && f.learnerName.trim();
    if (sectionId === 'reporter') return f.reporterName.trim() && f.reporterRole.trim();
    if (sectionId === 'incident') return f.incidentDateTime.trim() && f.incidentType.trim() && f.incidentTitle.trim() && f.description.trim();
    if (sectionId === 'people') return f.personAffectedType.trim();
    if (sectionId === 'harm') return f.actualHarm.trim() && f.potentialHarm.trim();
    if (sectionId === 'actions') return f.immediateActions.trim() && f.currentSafetyStatus.trim();
    if (sectionId === 'notifications') return true;
    if (sectionId === 'learning') return true;
    return false;
  }

  function formatDate(value) {
    if (!value) return 'Not completed';
    try {
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }).format(new Date(value));
    } catch (error) {
      return value;
    }
  }

  function clockHtml() {
    const d = new Date();
    const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(d);
    const date = new Intl.DateTimeFormat('en-GB').format(d);
    return `${escapeHtml(time)}<br>${escapeHtml(date)}`;
  }

  function optionHtml(options, selected) {
    return options.map(option => `<option value="${escapeHtml(option)}"${option === selected ? ' selected' : ''}>${escapeHtml(option)}</option>`).join('');
  }

  function input(name, label, opts = {}) {
    const type = opts.type || 'text';
    const required = !!opts.required;
    const help = opts.help ? `<span class="help">${escapeHtml(opts.help)}</span>` : '';
    const full = opts.full ? ' full' : '';
    return `
      <div class="field${full}">
        <label for="${escapeHtml(name)}" class="${required ? 'required' : ''}">${escapeHtml(label)}</label>
        <input id="${escapeHtml(name)}" data-field="${escapeHtml(name)}" type="${escapeHtml(type)}" value="${escapeHtml(fieldValue(name))}" placeholder="${escapeHtml(opts.placeholder || '')}" />
        ${help}
      </div>`;
  }

  function textarea(name, label, opts = {}) {
    const required = !!opts.required;
    const help = opts.help ? `<span class="help">${escapeHtml(opts.help)}</span>` : '';
    const full = opts.full === false ? '' : ' full';
    return `
      <div class="field${full}">
        <label for="${escapeHtml(name)}" class="${required ? 'required' : ''}">${escapeHtml(label)}</label>
        <textarea id="${escapeHtml(name)}" data-field="${escapeHtml(name)}" placeholder="${escapeHtml(opts.placeholder || '')}">${escapeHtml(fieldValue(name))}</textarea>
        ${help}
      </div>`;
  }

  function select(name, label, options, opts = {}) {
    const required = !!opts.required;
    const help = opts.help ? `<span class="help">${escapeHtml(opts.help)}</span>` : '';
    const full = opts.full ? ' full' : '';
    return `
      <div class="field${full}">
        <label for="${escapeHtml(name)}" class="${required ? 'required' : ''}">${escapeHtml(label)}</label>
        <select id="${escapeHtml(name)}" data-field="${escapeHtml(name)}">
          ${optionHtml(options, fieldValue(name))}
        </select>
        ${help}
      </div>`;
  }

  function checkbox(name, label) {
    return `
      <label class="check-item">
        <input type="checkbox" data-check="${escapeHtml(name)}" ${fieldValue(name) ? 'checked' : ''} />
        <span>${escapeHtml(label)}</span>
      </label>`;
  }

  function card(title, subtitle, body) {
    return `
      <section class="card">
        <div class="card-head">
          <h2>${escapeHtml(title)}</h2>
          ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}
        </div>
        <div class="card-body">${body}</div>
      </section>`;
  }

  function sectionBody() {
    const id = state.activeSection;

    if (id === 'simulation') {
      return card('Simulation context', 'This is for learning and debrief only. Do not use real patient identifiable information.', `
        <div class="grid-2">
          ${input('simulationScenario', 'Scenario/activity name', { required: true, placeholder: 'e.g. Luke Pale escalation scenario' })}
          ${input('simulationPart', 'Part/station', { placeholder: 'e.g. Part 3: safety report' })}
          ${input('learnerName', 'Learner or group name', { required: true, placeholder: 'e.g. Group A / learner initials' })}
          ${input('facilitatorName', 'Facilitator name')}
          ${input('placementArea', 'Simulation/placement area', { full: true })}
          ${textarea('simulationNotes', 'Simulation notes', { placeholder: 'Add any scenario-specific context that learners should consider.' })}
        </div>`);
    }

    if (id === 'reporter') {
      return card('Reporter details', 'In simulation, this can be the learner completing the report or the role they are playing.', `
        <div class="grid-2">
          ${input('reporterName', 'Reporter name', { required: true })}
          ${input('reporterRole', 'Reporter role', { required: true, placeholder: 'e.g. Practice Supervisor / Nurse in Charge' })}
          ${input('reporterEmail', 'Reporter email')}
          ${input('reporterPhone', 'Reporter contact number')}
        </div>`);
    }

    if (id === 'incident') {
      return card('Event details', 'Capture the facts in a clear, chronological way. Keep it factual rather than blame-focused.', `
        <div class="grid-2">
          ${input('incidentDateTime', 'Incident date/time', { type: 'datetime-local', required: true })}
          ${input('discoveredDateTime', 'Date/time discovered', { type: 'datetime-local' })}
          ${input('location', 'Location')}
          ${input('serviceArea', 'Service area')}
          ${select('incidentType', 'Incident type', ['', 'Medication', 'Fall', 'Documentation', 'Professional conduct', 'Safeguarding', 'Violence/aggression', 'Absence/non-attendance', 'Fraud/timesheet concern', 'Communication', 'Information governance', 'Other'], { required: true })}
          ${input('incidentTitle', 'Short title', { required: true, placeholder: 'Briefly summarise the concern' })}
          ${textarea('description', 'Description of what happened', { required: true, placeholder: 'What happened? Who was present? What was discovered? What was the immediate outcome?' })}
        </div>`);
    }

    if (id === 'people') {
      return card('People involved', 'Use fictional identifiers only in this training version.', `
        <div class="grid-2">
          ${select('personAffectedType', 'Person affected', ['Patient / service user', 'Staff member', 'Student', 'Visitor', 'No direct person affected', 'Other'])}
          ${input('patientInitials', 'Fictional patient/service user initials')}
          ${input('patientIdentifier', 'Fictional identifier', { help: 'Do not enter a real NHS number or hospital number.' })}
          ${select('ageGroup', 'Age group', ['', 'Child', 'Young person', 'Adult', 'Older adult', 'Not applicable'])}
          ${textarea('staffInvolved', 'Staff/student involved', { placeholder: 'Names/roles in the simulation scenario.' })}
          ${textarea('witnesses', 'Witnesses')}
          ${textarea('externalAgencies', 'External agencies')}
        </div>`);
    }

    if (id === 'harm') {
      return card('Harm and risk grading', 'Think about both what actually happened and what could reasonably have happened.', `
        <div class="grid-2">
          ${select('actualHarm', 'Actual harm', ['No harm', 'Low', 'Moderate', 'Severe', 'Death', 'Not known'])}
          ${select('potentialHarm', 'Potential harm', ['Low', 'Moderate', 'Severe', 'Death', 'Not known'])}
          ${select('clinicalReviewRequired', 'Clinical review required?', ['No', 'Yes', 'Already completed', 'Not applicable'])}
          ${input('treatmentRequired', 'Treatment/support required')}
        </div>`);
    }

    if (id === 'actions') {
      return card('Immediate actions taken', 'This is the safety-critical section: what did you do straight away to reduce risk?', `
        <div class="grid-2">
          ${textarea('immediateActions', 'Immediate actions taken', { required: true, placeholder: 'Who was informed? Was the person assessed? Was the area made safe? Was supervision increased?' })}
          ${textarea('currentSafetyStatus', 'Current safety status', { required: true, placeholder: 'Is anyone still at risk? What monitoring or follow-up is in place?' })}
        </div>`);
    }

    if (id === 'notifications') {
      return card('Notifications and escalation', 'Tick the people or teams informed as part of the simulated escalation.', `
        <div class="check-grid">
          ${checkbox('informedNurseInCharge', 'Nurse in charge')}
          ${checkbox('informedManager', 'Ward/service manager')}
          ${checkbox('informedDoctor', 'Medical team')}
          ${checkbox('informedSafeguarding', 'Safeguarding')}
          ${checkbox('informedPharmacy', 'Pharmacy')}
          ${checkbox('informedSecurityPolice', 'Security/police')}
          ${checkbox('informedUniversityPEF', 'University / PEF team')}
          ${checkbox('informedFamilyCarer', 'Family/carer')}
        </div>
        <div class="grid-2" style="margin-top:14px;">
          ${textarea('otherNotifications', 'Other notifications')}
          ${select('dutyOfCandourConsidered', 'Duty of candour considered?', ['Not applicable / no notifiable harm identified', 'Yes - considered but not triggered', 'Yes - triggered', 'Unsure - needs manager review'])}
          ${select('patientFamilyInformed', 'Patient/family informed?', ['Not applicable', 'No', 'Yes', 'Planned', 'Unsure'])}
          ${textarea('communicationNotes', 'Communication notes')}
        </div>`);
    }

    return card('Contributory factors and learning', 'Focus on systems, learning and next steps rather than blame.', `
      <div class="check-grid">
        ${checkbox('factorsStaffing', 'Staffing levels/workload')}
        ${checkbox('factorsCommunication', 'Communication')}
        ${checkbox('factorsDocumentation', 'Documentation')}
        ${checkbox('factorsEnvironment', 'Environment/layout')}
        ${checkbox('factorsEquipment', 'Equipment')}
        ${checkbox('factorsTraining', 'Training/competence')}
        ${checkbox('factorsPolicy', 'Policy unclear/not followed')}
        ${checkbox('factorsPatient', 'Patient/service user factors')}
        ${checkbox('factorsMedication', 'Medication process')}
        ${checkbox('factorsHandover', 'Handover')}
      </div>
      <div class="grid-2" style="margin-top:14px;">
        ${textarea('otherFactors', 'Other contributory factors')}
        ${textarea('reviewOutcome', 'Reviewer outcome / learning summary')}
        ${textarea('learningActions', 'Learning actions')}
        ${input('actionOwner', 'Action owner')}
        ${input('targetDate', 'Target date', { type: 'date' })}
        ${textarea('facilitatorDebriefNotes', 'Facilitator debrief notes')}
      </div>`);
  }

  function summaryRows() {
    const f = state.form;
    return [
      ['Scenario', f.simulationScenario || 'Not completed'],
      ['Learner/group', f.learnerName || 'Not completed'],
      ['Incident type', f.incidentType || 'Not completed'],
      ['Title', f.incidentTitle || 'Not completed'],
      ['Incident date/time', formatDate(f.incidentDateTime)],
      ['Actual harm', f.actualHarm],
      ['Potential harm', f.potentialHarm],
      ['Current status', f.currentSafetyStatus || 'Not completed'],
      ['Immediate actions', f.immediateActions || 'Not completed'],
      ['Description', f.description || 'Not completed']
    ];
  }

  function renderSummaryPanel() {
    const errors = validate();
    const completeCount = sections.filter(s => isSectionComplete(s.id)).length;
    return `
      <aside class="summary-panel" id="summaryPanel">
        <div class="summary-head">
          <h2>Review</h2>
          <p>Live summary of the learning report before it is submitted for facilitator review.</p>
        </div>
        <div class="kpi-grid">
          <div class="kpi-card"><span>Reference</span><strong>${escapeHtml(state.form.reference)}</strong></div>
          <div class="kpi-card"><span>Status</span><strong>${escapeHtml(state.form.status)}</strong></div>
          <div class="kpi-card"><span>Sections started</span><strong>${completeCount} / ${sections.length}</strong></div>
          <div class="kpi-card"><span>Required fields missing</span><strong>${errors.length}</strong></div>
        </div>
        ${errors.length ? `<div class="errors"><strong>Before submitting:</strong><ul>${errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul></div>` : ''}
        <div class="review-card">
          <h3>Report snapshot</h3>
          <div class="review-list">
            ${summaryRows().map(([label, value]) => `<div class="review-row"><span>${escapeHtml(label)}</span><p>${escapeHtml(value)}</p></div>`).join('')}
          </div>
        </div>
      </aside>`;
  }

  function renderSummaryOnly() {
    const target = document.getElementById('summaryPanel');
    if (target) {
      target.outerHTML = renderSummaryPanel();
    }
  }

  function render() {
    const app = document.getElementById('app');
    const errors = validate();
    const statusSubmitted = state.form.status.includes('Submitted');

    app.className = '';
    app.innerHTML = `
      <div class="shell">
        <header class="topbar">
          <div class="topline">
            <div class="logo-wrap">
              <div class="msft-mark">MSFT</div>
              <div class="app-title">
                <strong>Safety Learning Report</strong>
                <span>Mary Seacole Foundation Trust · simulation only</span>
              </div>
            </div>
            <div class="search-wrap">
              <span class="search-icon">⌕</span>
              <input id="searchInput" value="${escapeHtml(state.query)}" placeholder="Search report fields..." />
            </div>
            <button class="btn btn-primary" id="saveTop">Save draft</button>
            <button class="btn btn-dark" id="submitTop">Submit for review</button>
          </div>
          <nav class="navline">
            <span>File</span>
            <span class="active">Report</span>
            <span>Simulation</span>
            <span>Review</span>
            <span>Help</span>
          </nav>
        </header>

        <main class="main-grid">
          <aside class="side-panel">
            <div class="side-head">
              <div class="ref-pill"><span class="status-dot ${statusSubmitted ? 'submitted' : ''}"></span>${escapeHtml(state.form.reference)}</div>
              <h2>Report sections</h2>
              <p>Complete the form as part of the simulated incident escalation process.</p>
            </div>
            <div class="section-list">
              ${sections.map((section, index) => `
                <button class="section-tab ${state.activeSection === section.id ? 'active' : ''} ${isSectionComplete(section.id) ? 'complete' : ''}" data-section="${escapeHtml(section.id)}">
                  <span class="section-num">${index + 1}</span>
                  <span class="section-label"><strong>${escapeHtml(section.title)}</strong><span>${escapeHtml(section.sub)}</span></span>
                  <span class="section-check">${isSectionComplete(section.id) ? '✓' : ''}</span>
                </button>`).join('')}
            </div>
            <div class="side-actions">
              <button class="btn btn-full" id="exportBtn">Export JSON</button>
              <button class="btn btn-full" id="printBtn">Print summary</button>
              <button class="btn btn-danger btn-full" id="clearBtn">Clear draft</button>
            </div>
          </aside>

          <section class="form-panel">
            <div class="form-head">
              <div>
                <h1>${escapeHtml(sections.find(s => s.id === state.activeSection).title)}</h1>
                <p>This is a fictional MSFT simulation tool. It mirrors the structure of a safety incident report, but it is not a live clinical reporting system.</p>
              </div>
              <div class="sim-badge">SIMULATION<br>ONLY</div>
            </div>
            <div class="form-body">
              <div class="warning-box">
                <div class="warning-icon">!</div>
                <div><strong>Training environment:</strong> do not enter real patient information, real NHS numbers, real incident details or confidential placement information. Use the details provided in the simulation scenario.</div>
              </div>
              ${sectionBody()}
            </div>
            <div class="form-foot">
              <div class="foot-left">
                <button class="btn" id="prevBtn">← Previous</button>
                <button class="btn" id="nextBtn">Next →</button>
              </div>
              <div class="foot-right">
                <button class="btn btn-primary" id="saveBottom">Save draft</button>
                <button class="btn btn-dark" id="submitBottom">Submit for review</button>
              </div>
            </div>
          </section>

          ${renderSummaryPanel()}
        </main>

        <footer class="desktop-bar">
          <div class="desktop-inner">
            <div class="desktop-left"><span>🖥️</span><div class="desktop-search">⌕ Search</div></div>
            <div class="desktop-centre"><button class="task-btn">✉ MSFT Mail</button><button class="task-btn">◉ sPRD</button><button class="task-btn active">▣ Safety Report</button></div>
            <div class="desktop-right"><span>⏻</span><span>⌃</span><span>▭</span><span>⌁</span><span>🖨️</span><div id="clock" class="clock">${clockHtml()}</div></div>
          </div>
        </footer>
      </div>

      ${state.showIntro ? introHtml() : ''}
      ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ''}
    `;

    bindEvents();
  }

  function introHtml() {
    return `
      <div class="modal-backdrop" id="introModal">
        <div class="modal">
          <div class="modal-title-row">
            <div class="warning-icon">!</div>
            <div>
              <h1>MSFT Safety Learning Report</h1>
              <p class="help">Simulation-only reporting activity</p>
            </div>
          </div>
          <p>This app is designed for Mary Seacole Foundation Trust simulation sessions. It is not Datix and it is not connected to a live NHS reporting system.</p>
          <p>Use fictional scenario information only. The aim is to help learners practise recognising risk, writing factual reports, escalating concerns and identifying learning actions.</p>
          <p><strong>Start by completing the Simulation section.</strong></p>
          <div class="modal-actions"><button class="btn btn-primary" id="introClose">I understand</button></div>
        </div>
      </div>`;
  }

  function bindEvents() {
    document.querySelectorAll('[data-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeSection = btn.dataset.section;
        render();
      });
    });

    document.querySelectorAll('[data-field]').forEach(field => {
      field.addEventListener('input', event => {
        setField(event.target.dataset.field, event.target.value);
      });
      field.addEventListener('change', event => {
        setField(event.target.dataset.field, event.target.value);
      });
    });

    document.querySelectorAll('[data-check]').forEach(field => {
      field.addEventListener('change', event => {
        setCheckbox(event.target.dataset.check, event.target.checked);
      });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', event => {
        state.query = event.target.value;
      });
    }

    ['saveTop', 'saveBottom'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => { saveDraftSilent(); showToast('Draft saved in this browser.'); });
    });

    ['submitTop', 'submitBottom'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', submitReport);
    });

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportJson);

    const printBtn = document.getElementById('printBtn');
    if (printBtn) printBtn.addEventListener('click', () => window.print());

    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearDraft);

    const introClose = document.getElementById('introClose');
    if (introClose) {
      introClose.addEventListener('click', () => {
        sessionStorage.setItem('msft-slr-intro-seen', 'true');
        state.showIntro = false;
        render();
      });
    }

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => moveSection(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => moveSection(1));
  }

  function moveSection(direction) {
    const index = sections.findIndex(s => s.id === state.activeSection);
    const next = sections[index + direction];
    if (next) {
      state.activeSection = next.id;
      render();
    }
  }

  function submitReport() {
    const errors = validate();
    if (errors.length) {
      showToast(`Complete ${errors.length} required field${errors.length === 1 ? '' : 's'} before submitting.`);
      return;
    }
    state.form.status = 'Submitted for review';
    state.form.submittedOn = nowDateTimeLocal();
    saveDraftSilent();
    showToast('Report submitted for facilitator review.');
    render();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state.form, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.form.reference}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('JSON export created.');
  }

  function clearDraft() {
    const confirmed = window.confirm('Clear this draft and start again?');
    if (!confirmed) return;
    localStorage.removeItem(STORAGE_KEY);
    state.form = initialForm();
    state.activeSection = 'simulation';
    showToast('Draft cleared.');
    render();
  }

  window.addEventListener('error', function (event) {
    const app = document.getElementById('app');
    if (app) {
      app.className = 'app-loading';
      app.innerHTML = `<div class="loading-card"><div class="msft-mark">MSFT</div><p><strong>Something stopped the app loading.</strong></p><p>${escapeHtml(event.message || 'Unknown error')}</p></div>`;
    }
  });

  render();
  setInterval(() => {
    const clock = document.getElementById('clock');
    if (clock) clock.innerHTML = clockHtml();
  }, 30000);
})();
