import { req } from './client'

export interface Job {
  id: string
  name: string
  type: string
  cron: string
  accountId: string | null
  config: string | null
  isEnabled: number
  createdAt: string
  updatedAt: string
}

export interface JobRun {
  id: string
  jobId: string
  status: string
  startedAt: string
  finishedAt: string | null
  result: string | null
  error: string | null
}

export const jobApi = {
  list: () => req<Job[]>('/api/jobs'),
  create: (input: { name: string; type: string; cron: string }) =>
    req<Job>('/api/jobs', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: Record<string, unknown>) =>
    req<Job>(`/api/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  remove: (id: string) => req<{ id: string }>(`/api/jobs/${id}`, { method: 'DELETE' }),
  run: (id: string) => req<JobRun>(`/api/jobs/${id}/run`, { method: 'POST' }),
  runs: (id: string) => req<JobRun[]>(`/api/jobs/${id}/runs`),
}
