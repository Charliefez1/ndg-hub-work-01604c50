import { describe, it, expect } from 'vitest';
import { getStatusColor, getStatusBadgeClasses, formatStatus } from '@/lib/status-colors';

describe('getStatusColor', () => {
  it('returns correct colour for project statuses', () => {
    expect(getStatusColor('contracting', 'project')).toBe('warning');
    expect(getStatusColor('delivery', 'project')).toBe('success');
    expect(getStatusColor('closed', 'project')).toBe('text-3');
  });

  it('returns correct colour for task statuses', () => {
    expect(getStatusColor('todo', 'task')).toBe('text-3');
    expect(getStatusColor('in_progress', 'task')).toBe('info');
    expect(getStatusColor('done', 'task')).toBe('success');
    expect(getStatusColor('blocked', 'task')).toBe('destructive');
  });

  it('returns correct colour for invoice statuses', () => {
    expect(getStatusColor('draft', 'invoice')).toBe('text-3');
    expect(getStatusColor('paid', 'invoice')).toBe('success');
    expect(getStatusColor('overdue', 'invoice')).toBe('destructive');
  });

  it('returns correct colour for delivery statuses', () => {
    expect(getStatusColor('planning', 'delivery')).toBe('text-2');
    expect(getStatusColor('complete', 'delivery')).toBe('success');
    expect(getStatusColor('cancelled', 'delivery')).toBe('destructive');
  });

  it('returns correct colour for contract statuses', () => {
    expect(getStatusColor('signed', 'contract')).toBe('success');
    expect(getStatusColor('expired', 'contract')).toBe('warning');
  });

  it('returns fallback for unknown status', () => {
    expect(getStatusColor('nonexistent', 'project')).toBe('text-3');
  });
});

describe('getStatusBadgeClasses', () => {
  it('returns correct Tailwind classes for success colour', () => {
    expect(getStatusBadgeClasses('paid', 'invoice')).toBe('bg-success/15 text-success');
  });

  it('returns correct Tailwind classes for destructive colour', () => {
    expect(getStatusBadgeClasses('overdue', 'invoice')).toBe('bg-destructive/15 text-destructive');
  });

  it('returns muted fallback for unknown status', () => {
    expect(getStatusBadgeClasses('unknown', 'invoice')).toBe('bg-muted text-text-3');
  });
});

describe('formatStatus', () => {
  it('replaces underscores with spaces and capitalises', () => {
    expect(formatStatus('in_progress')).toBe('In Progress');
    expect(formatStatus('project_planning')).toBe('Project Planning');
    expect(formatStatus('feedback_analytics')).toBe('Feedback Analytics');
  });

  it('handles single word statuses', () => {
    expect(formatStatus('draft')).toBe('Draft');
    expect(formatStatus('paid')).toBe('Paid');
  });
});
