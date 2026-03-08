'use client';

import { useState } from 'react';

interface DocsPanelProps {
  onClose: () => void;
}

type Section = 'overview' | 'api' | 'statuses' | 'examples';

const sectionLabels: Record<Section, string> = {
  overview: 'Overview',
  api: 'API Reference',
  statuses: 'Statuses & Fields',
  examples: 'Examples',
};

export function DocsPanel({ onClose }: DocsPanelProps) {
  const [section, setSection] = useState<Section>('overview');

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-n-surface border-l border-n-border shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-n-border flex-shrink-0">
          <h2 className="text-base font-semibold text-n-text">Documentation</h2>
          <button onClick={onClose} className="p-1.5 text-n-text-dim hover:text-n-text hover:bg-n-hover rounded" title="Close docs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 px-5 py-2 border-b border-n-border flex-shrink-0">
          {(Object.keys(sectionLabels) as Section[]).map((s) => (
            <button key={s} onClick={() => setSection(s)}
              className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
                section === s
                  ? 'bg-n-elevated text-n-text'
                  : 'text-n-text-secondary hover:text-n-text hover:bg-n-hover'
              }`}>
              {sectionLabels[s]}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {section === 'overview' && <OverviewSection />}
          {section === 'api' && <ApiSection />}
          {section === 'statuses' && <StatusesSection />}
          {section === 'examples' && <ExamplesSection />}
        </div>
      </div>
    </div>
  );
}

/* ─── Shared Components ─── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-n-text mb-3">{children}</h3>;
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-xs font-semibold text-n-text mt-4 mb-2">{children}</h4>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-n-text-secondary leading-relaxed mb-3">{children}</p>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-n-elevated rounded-lg p-3 text-xs text-n-text-secondary overflow-x-auto mb-3 leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-n-border">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-2 pr-3 text-n-text-secondary font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-n-border">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-3 text-n-text-secondary">
                  <code className="text-n-text text-[11px] bg-n-elevated px-1 py-0.5 rounded">{cell}</code>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Sections ─── */

function OverviewSection() {
  return (
    <div>
      <SectionTitle>MWAH Project Hub</SectionTitle>
      <P>
        Project management tool for the MWAH CRM team. Used by both humans (via UI)
        and AI agents (via REST API) to track bugs, plan roadmap, log activity, and
        record architectural decisions.
      </P>

      <SubTitle>Tabs</SubTitle>
      <div className="space-y-2 mb-4">
        {[
          { name: 'Kanban', desc: 'Drag-and-drop task board with columns. Supports priority, labels, assignees, due dates.' },
          { name: 'Issues', desc: 'Bug/issue tracker. Filterable table with inline editing, custom fields, and file attachments.' },
          { name: 'Roadmap', desc: 'Timeline grouped by phase (Immediate, Short-term, Medium-term, Long-term). Click items to edit.' },
          { name: 'Activity', desc: 'Append-only feed. Immutable audit log — no edits, no deletes. Claudes auto-post here.' },
          { name: 'Decisions', desc: 'Architectural decision log. Tracks settled, open, and superseded decisions.' },
        ].map((tab) => (
          <div key={tab.name} className="bg-n-elevated rounded-lg p-3">
            <span className="text-xs font-medium text-n-text">{tab.name}</span>
            <span className="text-xs text-n-text-secondary ml-2">{tab.desc}</span>
          </div>
        ))}
      </div>

      <SubTitle>Team Members</SubTitle>
      <P>Valid values for assignee, reporter, and actor fields:</P>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {["Kyle", "Nghiem", "Kyle's Claude", "Nghiem's Claude"].map((m) => (
          <span key={m} className="px-2 py-1 bg-n-elevated rounded text-xs text-n-text">{m}</span>
        ))}
      </div>

      <SubTitle>Priority Levels</SubTitle>
      <div className="space-y-1 mb-4">
        {[
          { code: 'P0', label: 'Critical', color: 'rgba(235,87,87,0.15)', text: 'rgba(235,87,87,1)', desc: 'Production-breaking, immediate fix' },
          { code: 'P1', label: 'High', color: 'rgba(217,115,13,0.15)', text: 'rgba(217,115,13,1)', desc: 'Major bug or blocker, fix this sprint' },
          { code: 'P2', label: 'Medium', color: 'rgba(203,145,47,0.15)', text: 'rgba(203,145,47,1)', desc: 'Should fix, not blocking' },
          { code: 'P3', label: 'Low', color: 'rgba(120,119,116,0.15)', text: 'rgba(120,119,116,1)', desc: 'Nice to have, backlog' },
        ].map((p) => (
          <div key={p.code} className="flex items-center gap-2">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-sm" style={{ backgroundColor: p.color, color: p.text }}>{p.label}</span>
            <span className="text-xs text-n-text-dim">{p.code}</span>
            <span className="text-xs text-n-text-secondary">{p.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiSection() {
  return (
    <div>
      <SectionTitle>API Reference</SectionTitle>
      <P>All endpoints accept and return JSON. Use these from Claude agents or any HTTP client.</P>

      <SubTitle>Tasks (Kanban)</SubTitle>
      <Table headers={['Method', 'Endpoint', 'Description']} rows={[
        ['GET', '/api/tasks?boardId=&priority=&assignee=', 'List tasks with filters'],
        ['POST', '/api/tasks', 'Create task'],
        ['GET', '/api/tasks/[id]', 'Get single task'],
        ['PATCH', '/api/tasks/[id]', 'Update task'],
        ['DELETE', '/api/tasks/[id]', 'Delete task'],
      ]} />
      <P>Fields: title, description, columnId, position, notes, priority (P0-P3), labels (JSON array), assignee, dueDate, boardId</P>

      <SubTitle>Board View</SubTitle>
      <Table headers={['Method', 'Endpoint', 'Description']} rows={[
        ['GET', '/api/board?boardId=1', 'Full board with columns + tasks'],
      ]} />

      <SubTitle>Issues</SubTitle>
      <Table headers={['Method', 'Endpoint', 'Description']} rows={[
        ['GET', '/api/issues?priority=&status=&component=&assignee=&search=', 'List with filters'],
        ['POST', '/api/issues', 'Create issue'],
        ['GET', '/api/issues/[id]', 'Get single issue'],
        ['PATCH', '/api/issues/[id]', 'Update issue'],
        ['DELETE', '/api/issues/[id]', 'Delete issue'],
      ]} />
      <P>Fields: title, description, priority, status, component, assignee, reporter, versionFound, versionFixed, stepsToReproduce, attachments (JSON array), customFields (JSON object)</P>

      <SubTitle>Roadmap</SubTitle>
      <Table headers={['Method', 'Endpoint', 'Description']} rows={[
        ['GET', '/api/roadmap?phase=&status=&assignee=', 'List with filters'],
        ['POST', '/api/roadmap', 'Create item'],
        ['GET', '/api/roadmap/[id]', 'Get single item'],
        ['PATCH', '/api/roadmap/[id]', 'Update item'],
        ['DELETE', '/api/roadmap/[id]', 'Delete item'],
      ]} />
      <P>Fields: title, description, phase, status, assignees (JSON array), startDate, targetDate, dependencies (JSON array of IDs), sortOrder, attachments (JSON array)</P>

      <SubTitle>Activities (Append-Only)</SubTitle>
      <Table headers={['Method', 'Endpoint', 'Description']} rows={[
        ['GET', '/api/activities?actor=&limit=50&offset=0', 'List, newest first'],
        ['POST', '/api/activities', 'Log activity'],
        ['GET', '/api/activities/[id]', 'Get single entry'],
      ]} />
      <P>No PATCH. No DELETE. Immutable audit log. Fields: actor (required), action (required), context (optional JSON), metadata (optional JSON)</P>

      <SubTitle>Decisions</SubTitle>
      <Table headers={['Method', 'Endpoint', 'Description']} rows={[
        ['GET', '/api/decisions?status=&category=&search=', 'List with filters'],
        ['POST', '/api/decisions', 'Create decision'],
        ['GET', '/api/decisions/[id]', 'Get single decision'],
        ['PATCH', '/api/decisions/[id]', 'Update decision'],
        ['DELETE', '/api/decisions/[id]', 'Delete decision'],
      ]} />
      <P>Fields: title, description, status, category, supersededBy (ID of replacement)</P>

      <SubTitle>Upload</SubTitle>
      <Table headers={['Method', 'Endpoint', 'Description']} rows={[
        ['POST', '/api/upload', 'Upload file (multipart, max 10MB). Returns {"{url, name, type, size}"}'],
      ]} />

      <SubTitle>Seed</SubTitle>
      <Table headers={['Method', 'Endpoint', 'Description']} rows={[
        ['POST', '/api/seed', 'Seed DB with defaults'],
      ]} />
    </div>
  );
}

function StatusesSection() {
  return (
    <div>
      <SectionTitle>Statuses & Field Values</SectionTitle>

      <SubTitle>Issue Statuses</SubTitle>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {[
          { value: 'backlog', label: 'Backlog' },
          { value: 'triaged', label: 'Triaged' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'fixed', label: 'Fixed' },
          { value: 'closed', label: 'Closed' },
          { value: 'wont_fix', label: "Won't Fix" },
        ].map((s) => (
          <span key={s.value} className="px-2 py-1 bg-n-elevated rounded text-xs text-n-text" title={`API value: ${s.value}`}>
            {s.label} <span className="text-n-text-dim ml-1">{s.value}</span>
          </span>
        ))}
      </div>

      <SubTitle>Roadmap Phases</SubTitle>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {[
          { value: 'immediate', label: 'Immediate' },
          { value: 'short_term', label: 'Short-term' },
          { value: 'medium_term', label: 'Medium-term' },
          { value: 'long_term', label: 'Long-term' },
        ].map((p) => (
          <span key={p.value} className="px-2 py-1 bg-n-elevated rounded text-xs text-n-text" title={`API value: ${p.value}`}>
            {p.label} <span className="text-n-text-dim ml-1">{p.value}</span>
          </span>
        ))}
      </div>

      <SubTitle>Roadmap Statuses</SubTitle>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {[
          { value: 'backlog', label: 'Backlog' },
          { value: 'mockup', label: 'Mockup Needed' },
          { value: 'approved', label: 'Approved' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'done', label: 'Done' },
        ].map((s) => (
          <span key={s.value} className="px-2 py-1 bg-n-elevated rounded text-xs text-n-text" title={`API value: ${s.value}`}>
            {s.label} <span className="text-n-text-dim ml-1">{s.value}</span>
          </span>
        ))}
      </div>

      <SubTitle>Decision Statuses</SubTitle>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {[
          { value: 'settled', label: 'Settled' },
          { value: 'open', label: 'Open' },
          { value: 'superseded', label: 'Superseded' },
        ].map((s) => (
          <span key={s.value} className="px-2 py-1 bg-n-elevated rounded text-xs text-n-text" title={`API value: ${s.value}`}>
            {s.label} <span className="text-n-text-dim ml-1">{s.value}</span>
          </span>
        ))}
      </div>

      <SubTitle>Decision Categories</SubTitle>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {['Architecture', 'Design', 'Security', 'Orders', 'Email', 'Calendar', 'Dashboard', 'Contacts', 'Portal', 'Infrastructure'].map((c) => (
          <span key={c} className="px-2 py-1 bg-n-elevated rounded text-xs text-n-text">{c}</span>
        ))}
      </div>

      <SubTitle>Components (Issues)</SubTitle>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {['Orders', 'Email', 'Calendar', 'Dashboard', 'Store Detail', 'Contact Detail', 'Admin', 'Map', 'Activity', 'Auth', 'Cloud Functions', 'Other'].map((c) => (
          <span key={c} className="px-2 py-1 bg-n-elevated rounded text-xs text-n-text">{c}</span>
        ))}
      </div>
    </div>
  );
}

function ExamplesSection() {
  return (
    <div>
      <SectionTitle>Example API Calls</SectionTitle>
      <P>Copy these curl commands or adapt for your HTTP client. Replace the base URL with your deployment.</P>

      <SubTitle>Log Completed Work</SubTitle>
      <Code>{`POST /api/activities
{
  "actor": "Nghiem's Claude",
  "action": "Cleaned up 57 console.logs across 6 JS files"
}`}</Code>

      <SubTitle>Create a Bug</SubTitle>
      <Code>{`POST /api/issues
{
  "title": "Silent catch in orders.js line 340",
  "priority": "P1",
  "component": "Orders",
  "reporter": "Nghiem's Claude"
}`}</Code>

      <SubTitle>Update Issue After Fix</SubTitle>
      <Code>{`PATCH /api/issues/7
{
  "status": "fixed",
  "versionFixed": "v67.5",
  "assignee": "Nghiem's Claude"
}`}</Code>

      <SubTitle>Check Decisions Before Modifying Code</SubTitle>
      <Code>{`GET /api/decisions?category=Orders`}</Code>

      <SubTitle>Add Roadmap Item</SubTitle>
      <Code>{`POST /api/roadmap
{
  "title": "Store Portal v1",
  "phase": "medium_term",
  "status": "backlog",
  "assignees": ["Kyle's Claude"],
  "dependencies": [3]
}`}</Code>

      <SubTitle>Search Issues</SubTitle>
      <Code>{`GET /api/issues?search=console.log&priority=P1`}</Code>

      <SubTitle>Create a Task on the Kanban Board</SubTitle>
      <Code>{`POST /api/tasks
{
  "title": "Fix auth redirect loop",
  "columnId": 2,
  "priority": "P1",
  "assignee": "Kyle's Claude",
  "labels": ["Auth"],
  "boardId": 1
}`}</Code>
    </div>
  );
}
