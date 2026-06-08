const { useMemo, useState } = React;

const STORAGE_KEY = 'msft-safety-learning-report-draft-v3';

const initialForm = {
  reporterName: '',
  reporterRole: '',
  reporterEmail: '',
  reporterPhone: '',
  reportedOn: new Date().toISOString().slice(0, 16),

  simulationScenario: '',
  simulationPart: '',
  learnerName: '',
  facilitatorName: '',
  simulationNotes: '',

  incidentDateTime: '',
  discoveredDateTime: '',
  location: '',
  serviceArea: '',
  incidentType: '',
  incidentTitle: '',
  description: '',

  personAffectedType: 'Patient',
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
  reviewerComments: '',
  learningIdentified: '',
  actionPlan: '',
  actionOwner: '',
  targetDate: '',
  status: 'Draft',
};

const requiredFields = [
  ['reporterName', 'Reporter name'],
  ['reporterRole', 'Reporter role'],
  ['incidentDateTime', 'Date and time of incident'],
  ['location', 'Location'],
  ['incidentType', 'Incident type'],
  ['incidentTitle', 'Incident title'],
  ['description', 'Description of what happened'],
  ['actualHarm', 'Actual harm'],
  ['immediateActions', 'Immediate actions taken'],
  ['currentSafetyStatus', 'Current safety status'],
];

const incidentTypes = [
  'Medication',
  'Fall',
  'Violence / aggression',
  'Safeguarding concern',
  'Self-harm / ligature / suicide risk',
  'Absconding / missing patient',
  'Documentation / records',
  'Pressure damage / skin integrity',
  'Infection prevention and control',
  'Staffing / capacity',
  'Equipment / estates',
  'Information governance',
  'Professional conduct / student concern',
  'Other',
];

const harmLevels = ['No harm', 'Low', 'Moderate', 'Severe', 'Death'];
const potentialHarmLevels = ['None', 'Low', 'Moderate', 'Severe', 'Death'];

function makeReference() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `MSFT-SLR-${date}-${random}`;
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function Field({ label, children, required, hint }) {
  return (
    <label className="field">
      <span className="label-row">
        <span>{label}{required ? <em> *</em> : null}</span>
      </span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function TextInput({ value, onChange, ...props }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} {...props} />;
}

function TextArea({ value, onChange, ...props }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} {...props} />;
}

function Select({ value, onChange, children, ...props }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} {...props}>{children}</select>;
}

function Check({ checked, onChange, label }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Section({ icon, title, subtitle, children }) {
  return (
    <section className="card">
      <div className="section-heading">
        <div className="section-icon" aria-hidden="true">{icon}</div>
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="summary-row">
      <dt>{label}</dt>
      <dd>{value || 'Not recorded'}</dd>
    </div>
  );
}

function App() {
  const [form, setForm] = useState(() => {
    const saved = safeJsonParse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...initialForm, ...saved } : initialForm;
  });
  const [reference, setReference] = useState(() => localStorage.getItem(`${STORAGE_KEY}-ref`) || makeReference());
  const [mode, setMode] = useState('form');
  const [submitted, setSubmitted] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const missing = useMemo(() => requiredFields.filter(([key]) => !String(form[key] || '').trim()), [form]);
  const canSubmit = missing.length === 0;

  const notifications = [
    form.informedNurseInCharge && 'Nurse in charge',
    form.informedManager && 'Manager / Matron',
    form.informedDoctor && 'Medical team',
    form.informedSafeguarding && 'Safeguarding',
    form.informedPharmacy && 'Pharmacy',
    form.informedSecurityPolice && 'Security / Police',
    form.informedUniversityPEF && 'University / PEF team',
    form.informedFamilyCarer && 'Family / carer',
    form.otherNotifications,
  ].filter(Boolean).join(', ');

  const factors = [
    form.factorsStaffing && 'Staffing / workload',
    form.factorsCommunication && 'Communication',
    form.factorsDocumentation && 'Documentation',
    form.factorsEnvironment && 'Environment',
    form.factorsEquipment && 'Equipment',
    form.factorsTraining && 'Training / competence',
    form.factorsPolicy && 'Policy / process',
    form.factorsPatient && 'Patient factors',
    form.factorsMedication && 'Medication process',
    form.factorsHandover && 'Handover',
    form.otherFactors,
  ].filter(Boolean).join(', ');

  function saveDraft() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    localStorage.setItem(`${STORAGE_KEY}-ref`, reference);
    setSubmitted(false);
    alert('Draft saved on this device.');
  }

  function clearDraft() {
    const ok = window.confirm('Clear this draft? This only removes the local browser copy.');
    if (!ok) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(`${STORAGE_KEY}-ref`);
    setForm({ ...initialForm, reportedOn: new Date().toISOString().slice(0, 16) });
    setReference(makeReference());
    setSubmitted(false);
  }

  function downloadJson() {
    const payload = {
      reference,
      trust: 'Mary Seacole Foundation Trust',
      reportName: 'MSFT Safety Learning Report',
      simulationOnly: true,
      createdAt: new Date().toISOString(),
      form,
      derived: { notifications, contributingFactors: factors },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reference}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function submitReport() {
    if (!canSubmit) {
      setMode('form');
      return;
    }
    const updated = { ...form, status: 'Submitted for review' };
    setForm(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(`${STORAGE_KEY}-ref`, reference);
    setSubmitted(true);
    setMode('review');
  }

  return (
    <>
    <main>
      <header className="hero">
        <div className="brand-head">
          <div className="msft-logo" aria-hidden="true">MSFT</div>
          <div>
            <p className="eyebrow">Mary Seacole Foundation Trust</p>
            <h1>Safety Learning Report</h1>
            <p className="hero-copy">Simulation incident, concern and learning report form</p>
          </div>
        </div>
        <div className="reference-box">
          <span>Reference</span>
          <strong>{reference}</strong>
          <small>{form.status}</small>
        </div>
      </header>

      <div className="simulation-ribbon">
        <span>Simulation context</span>
        <strong>Training system only — do not enter real patient identifiable information.</strong>
      </div>

      <div className="notice">
        <span aria-hidden="true">ℹ️</span>
        <p>
          Record clear, factual information only. Avoid blame, speculation or unnecessary confidential details.
          In a real clinical setting, urgent safety concerns must still be escalated immediately through local clinical routes.
        </p>
      </div>

      <nav className="tabs" aria-label="Form navigation">
        <button className={mode === 'form' ? 'active' : ''} onClick={() => setMode('form')}>Complete form</button>
        <button className={mode === 'review' ? 'active' : ''} onClick={() => setMode('review')}>Review summary</button>
      </nav>

      {submitted ? (
        <div className="success">
          <span aria-hidden="true">✅</span>
          <div>
            <strong>Report submitted for review.</strong>
            <span>This demo stores the report locally. Connect the submit function to your backend or database for production use.</span>
          </div>
        </div>
      ) : null}

      {mode === 'form' ? (
        <div className="layout">
          <div className="form-stack">
            <Section icon="👤" title="Reporter details" subtitle="Details of the person completing the report.">
              <div className="grid two">
                <Field label="Reporter name" required><TextInput value={form.reporterName} onChange={(v) => set('reporterName', v)} /></Field>
                <Field label="Role / job title" required><TextInput value={form.reporterRole} onChange={(v) => set('reporterRole', v)} placeholder="e.g. Practice Supervisor, student nurse, facilitator" /></Field>
                <Field label="Email"><TextInput type="email" value={form.reporterEmail} onChange={(v) => set('reporterEmail', v)} /></Field>
                <Field label="Telephone / bleep"><TextInput value={form.reporterPhone} onChange={(v) => set('reporterPhone', v)} /></Field>
              </div>
              <Field label="Report created"><TextInput type="datetime-local" value={form.reportedOn} onChange={(v) => set('reportedOn', v)} /></Field>
            </Section>

            <Section icon="🎓" title="Simulation details" subtitle="Optional information for the facilitator, debrief or Blackboard evidence.">
              <div className="grid two">
                <Field label="Scenario / activity name"><TextInput value={form.simulationScenario} onChange={(v) => set('simulationScenario', v)} placeholder="e.g. Day on the Ward - Incident Reporting Task" /></Field>
                <Field label="Part / station"><TextInput value={form.simulationPart} onChange={(v) => set('simulationPart', v)} placeholder="e.g. Part 3, Station 2" /></Field>
                <Field label="Learner name or group"><TextInput value={form.learnerName} onChange={(v) => set('learnerName', v)} placeholder="Use simulated or teaching identifiers only" /></Field>
                <Field label="Facilitator"><TextInput value={form.facilitatorName} onChange={(v) => set('facilitatorName', v)} /></Field>
              </div>
              <Field label="Facilitator notes / debrief prompt"><TextArea rows="3" value={form.simulationNotes} onChange={(v) => set('simulationNotes', v)} placeholder="For example: focus on factual wording, immediate escalation, harm grading and learning actions." /></Field>
            </Section>

            <Section icon="📋" title="Incident details" subtitle="What happened, where it happened and when it happened.">
              <div className="grid two">
                <Field label="Date and time of incident" required><TextInput type="datetime-local" value={form.incidentDateTime} onChange={(v) => set('incidentDateTime', v)} /></Field>
                <Field label="Date and time discovered"><TextInput type="datetime-local" value={form.discoveredDateTime} onChange={(v) => set('discoveredDateTime', v)} /></Field>
                <Field label="Location / ward / department" required><TextInput value={form.location} onChange={(v) => set('location', v)} placeholder="e.g. Seacole Ward, Bay 2" /></Field>
                <Field label="Service area"><TextInput value={form.serviceArea} onChange={(v) => set('serviceArea', v)} placeholder="e.g. Adult inpatient, community, simulation placement" /></Field>
              </div>
              <div className="grid two">
                <Field label="Incident type" required>
                  <Select value={form.incidentType} onChange={(v) => set('incidentType', v)}>
                    <option value="">Select a category</option>
                    {incidentTypes.map((type) => <option key={type}>{type}</option>)}
                  </Select>
                </Field>
                <Field label="Incident title" required><TextInput value={form.incidentTitle} onChange={(v) => set('incidentTitle', v)} placeholder="Brief factual title" /></Field>
              </div>
              <Field label="Description of what happened" required hint="Use a clear, chronological description. Avoid blame, assumptions or personal opinions.">
                <TextArea rows="6" value={form.description} onChange={(v) => set('description', v)} placeholder="Describe what happened before, during and after the incident..." />
              </Field>
            </Section>

            <Section icon="🏥" title="People involved" subtitle="Record who was affected or involved, using local confidentiality rules.">
              <div className="grid three">
                <Field label="Person affected">
                  <Select value={form.personAffectedType} onChange={(v) => set('personAffectedType', v)}>
                    <option>Patient</option><option>Staff member</option><option>Student</option><option>Visitor</option><option>No individual affected</option>
                  </Select>
                </Field>
                <Field label="Patient initials / identifier"><TextInput value={form.patientInitials} onChange={(v) => set('patientInitials', v)} /></Field>
                <Field label="Age group"><Select value={form.ageGroup} onChange={(v) => set('ageGroup', v)}><option value="">Select</option><option>Child</option><option>Young person</option><option>Adult</option><option>Older adult</option><option>Not applicable</option></Select></Field>
              </div>
              <Field label="Patient number / local identifier"><TextInput value={form.patientIdentifier} onChange={(v) => set('patientIdentifier', v)} /></Field>
              <Field label="Staff involved"><TextArea rows="3" value={form.staffInvolved} onChange={(v) => set('staffInvolved', v)} /></Field>
              <Field label="Witnesses"><TextArea rows="3" value={form.witnesses} onChange={(v) => set('witnesses', v)} /></Field>
              <Field label="External agencies involved"><TextInput value={form.externalAgencies} onChange={(v) => set('externalAgencies', v)} placeholder="e.g. ambulance, police, safeguarding, university" /></Field>
            </Section>

            <Section icon="⚠️" title="Harm, risk and immediate safety actions" subtitle="Capture actual harm, potential harm and what was done straight away.">
              <div className="grid three">
                <Field label="Actual harm" required><Select value={form.actualHarm} onChange={(v) => set('actualHarm', v)}>{harmLevels.map((level) => <option key={level}>{level}</option>)}</Select></Field>
                <Field label="Potential harm"><Select value={form.potentialHarm} onChange={(v) => set('potentialHarm', v)}>{potentialHarmLevels.map((level) => <option key={level}>{level}</option>)}</Select></Field>
                <Field label="Clinical review required"><Select value={form.clinicalReviewRequired} onChange={(v) => set('clinicalReviewRequired', v)}><option>No</option><option>Yes</option><option>Already completed</option><option>Not applicable</option></Select></Field>
              </div>
              <Field label="Treatment, observations or further monitoring required"><TextArea rows="3" value={form.treatmentRequired} onChange={(v) => set('treatmentRequired', v)} /></Field>
              <Field label="Immediate actions taken" required><TextArea rows="4" value={form.immediateActions} onChange={(v) => set('immediateActions', v)} placeholder="For example: patient assessed, senior informed, observations completed, area made safe..." /></Field>
              <Field label="Current safety status" required><TextArea rows="3" value={form.currentSafetyStatus} onChange={(v) => set('currentSafetyStatus', v)} placeholder="What is the current position and is anyone still at risk?" /></Field>
            </Section>

            <Section icon="📣" title="Notifications and escalation" subtitle="Who has been informed or needs to be informed?">
              <div className="checks">
                <Check checked={form.informedNurseInCharge} onChange={(v) => set('informedNurseInCharge', v)} label="Nurse in charge" />
                <Check checked={form.informedManager} onChange={(v) => set('informedManager', v)} label="Manager / Matron" />
                <Check checked={form.informedDoctor} onChange={(v) => set('informedDoctor', v)} label="Medical team" />
                <Check checked={form.informedSafeguarding} onChange={(v) => set('informedSafeguarding', v)} label="Safeguarding" />
                <Check checked={form.informedPharmacy} onChange={(v) => set('informedPharmacy', v)} label="Pharmacy" />
                <Check checked={form.informedSecurityPolice} onChange={(v) => set('informedSecurityPolice', v)} label="Security / Police" />
                <Check checked={form.informedUniversityPEF} onChange={(v) => set('informedUniversityPEF', v)} label="University / PEF team" />
                <Check checked={form.informedFamilyCarer} onChange={(v) => set('informedFamilyCarer', v)} label="Family / carer" />
              </div>
              <Field label="Other notifications"><TextInput value={form.otherNotifications} onChange={(v) => set('otherNotifications', v)} /></Field>
            </Section>

            <Section icon="💬" title="Communication and duty of candour" subtitle="Record whether the patient/family has been informed and whether formal candour is required.">
              <div className="grid two">
                <Field label="Duty of candour considered">
                  <Select value={form.dutyOfCandourConsidered} onChange={(v) => set('dutyOfCandourConsidered', v)}>
                    <option>Not applicable / no notifiable harm identified</option>
                    <option>Considered - not triggered</option>
                    <option>Triggered - verbal apology/information given</option>
                    <option>Triggered - written follow-up required</option>
                    <option>Requires manager review</option>
                  </Select>
                </Field>
                <Field label="Patient/family informed"><Select value={form.patientFamilyInformed} onChange={(v) => set('patientFamilyInformed', v)}><option>Not applicable</option><option>No</option><option>Yes - patient</option><option>Yes - family/carer</option><option>Planned</option></Select></Field>
              </div>
              <Field label="Communication notes"><TextArea rows="4" value={form.communicationNotes} onChange={(v) => set('communicationNotes', v)} /></Field>
            </Section>

            <Section icon="🔎" title="Contributory factors" subtitle="Select likely factors to support learning rather than blame.">
              <div className="checks">
                <Check checked={form.factorsStaffing} onChange={(v) => set('factorsStaffing', v)} label="Staffing / workload" />
                <Check checked={form.factorsCommunication} onChange={(v) => set('factorsCommunication', v)} label="Communication" />
                <Check checked={form.factorsDocumentation} onChange={(v) => set('factorsDocumentation', v)} label="Documentation" />
                <Check checked={form.factorsEnvironment} onChange={(v) => set('factorsEnvironment', v)} label="Environment" />
                <Check checked={form.factorsEquipment} onChange={(v) => set('factorsEquipment', v)} label="Equipment" />
                <Check checked={form.factorsTraining} onChange={(v) => set('factorsTraining', v)} label="Training / competence" />
                <Check checked={form.factorsPolicy} onChange={(v) => set('factorsPolicy', v)} label="Policy / process" />
                <Check checked={form.factorsPatient} onChange={(v) => set('factorsPatient', v)} label="Patient factors" />
                <Check checked={form.factorsMedication} onChange={(v) => set('factorsMedication', v)} label="Medication process" />
                <Check checked={form.factorsHandover} onChange={(v) => set('factorsHandover', v)} label="Handover" />
              </div>
              <Field label="Other contributory factors"><TextArea rows="3" value={form.otherFactors} onChange={(v) => set('otherFactors', v)} /></Field>
            </Section>

            <Section icon="🔐" title="Manager / reviewer section" subtitle="Optional review area for learning, actions and closure.">
              <div className="grid two">
                <Field label="Reviewer name"><TextInput value={form.reviewerName} onChange={(v) => set('reviewerName', v)} /></Field>
                <Field label="Reviewer role"><TextInput value={form.reviewerRole} onChange={(v) => set('reviewerRole', v)} /></Field>
              </div>
              <Field label="Reviewer comments"><TextArea rows="4" value={form.reviewerComments} onChange={(v) => set('reviewerComments', v)} /></Field>
              <Field label="Learning identified"><TextArea rows="4" value={form.learningIdentified} onChange={(v) => set('learningIdentified', v)} /></Field>
              <Field label="Action plan"><TextArea rows="4" value={form.actionPlan} onChange={(v) => set('actionPlan', v)} placeholder="Action, owner, deadline and evidence of completion." /></Field>
              <div className="grid three">
                <Field label="Action owner"><TextInput value={form.actionOwner} onChange={(v) => set('actionOwner', v)} /></Field>
                <Field label="Target date"><TextInput type="date" value={form.targetDate} onChange={(v) => set('targetDate', v)} /></Field>
                <Field label="Status"><Select value={form.status} onChange={(v) => set('status', v)}><option>Draft</option><option>Submitted for review</option><option>Under review</option><option>Actions open</option><option>Closed</option></Select></Field>
              </div>
            </Section>
          </div>

          <aside className="side-panel">
            <div className="sticky">
              <h3>Completion check</h3>
              {canSubmit ? (
                <p className="ok">✅ Required fields complete</p>
              ) : (
                <>
                  <p className="warn">⚠️ {missing.length} required field{missing.length === 1 ? '' : 's'} missing</p>
                  <ul>{missing.map(([, label]) => <li key={label}>{label}</li>)}</ul>
                </>
              )}
              <div className="button-stack">
                <button className="primary" onClick={() => setMode('review')}>Review summary</button>
                <button onClick={saveDraft}>💾 Save draft</button>
                <button onClick={downloadJson}>⬇️ Export JSON</button>
                <button className="danger" onClick={clearDraft}>🗑️ Clear draft</button>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <section className="card review-card">
          <div className="review-header">
            <div>
              <h2>Review summary</h2>
              <p>Check the details before submitting for review.</p>
            </div>
            <div className="review-actions">
              <button onClick={() => setMode('form')}>Edit form</button>
              <button onClick={() => window.print()}>🖨️ Print</button>
              <button onClick={downloadJson}>⬇️ Export JSON</button>
            </div>
          </div>

          {!canSubmit ? (
            <div className="notice error">
              <span aria-hidden="true">⚠️</span>
              <p>Complete the required fields before submitting: {missing.map((m) => m[1]).join(', ')}.</p>
            </div>
          ) : null}

          <dl className="summary">
            <SummaryRow label="Reference" value={reference} />
            <SummaryRow label="Reporter" value={`${form.reporterName} (${form.reporterRole})`} />
            <SummaryRow label="Simulation scenario" value={form.simulationScenario} />
            <SummaryRow label="Learner / group" value={form.learnerName} />
            <SummaryRow label="Incident date/time" value={form.incidentDateTime} />
            <SummaryRow label="Location" value={`${form.location}${form.serviceArea ? ` - ${form.serviceArea}` : ''}`} />
            <SummaryRow label="Incident type" value={form.incidentType} />
            <SummaryRow label="Title" value={form.incidentTitle} />
            <SummaryRow label="Description" value={form.description} />
            <SummaryRow label="Person affected" value={`${form.personAffectedType}${form.patientInitials ? ` - ${form.patientInitials}` : ''}`} />
            <SummaryRow label="Actual / potential harm" value={`${form.actualHarm} / ${form.potentialHarm}`} />
            <SummaryRow label="Immediate actions" value={form.immediateActions} />
            <SummaryRow label="Current safety status" value={form.currentSafetyStatus} />
            <SummaryRow label="Notifications" value={notifications} />
            <SummaryRow label="Duty of candour" value={form.dutyOfCandourConsidered} />
            <SummaryRow label="Communication notes" value={form.communicationNotes} />
            <SummaryRow label="Contributory factors" value={factors} />
            <SummaryRow label="Learning identified" value={form.learningIdentified} />
            <SummaryRow label="Action plan" value={form.actionPlan} />
          </dl>

          <div className="submit-row">
            <button className="primary large" disabled={!canSubmit} onClick={submitReport}>Submit for review</button>
          </div>
        </section>
      )}
    </main>
    <footer className="desktop-bar">
      <div className="desktop-inner">
        <div className="desktop-left">
          <span>🖥️</span>
          <div className="desktop-search">⌕ Search</div>
        </div>
        <div className="desktop-centre">
          <button className="task-btn secondary">✉ MSFT Mail</button>
          <button className="task-btn">▲ Safety Report</button>
        </div>
        <div className="desktop-right">
          <span>▭</span>
          <span>⌁</span>
          <span>🖨️</span>
          <div className="clock">Simulation<br />MSFT</div>
        </div>
      </div>
    </footer>
    </>
  );
}


ReactDOM.createRoot(document.getElementById('root')).render(<App />);
