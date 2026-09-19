import { useQuery } from '@tanstack/react-query'
import { listProjectEvidence, listProjectRuns } from './fetchers'
import type { CliRun, ProjectEvidence } from './schemas'

const keys = {
  panels: (projectId: string) => ['project-panels', projectId] as const,
}

export type ProjectPanels = {
  runs: CliRun[]
  evidence: ProjectEvidence[]
}

export const useProjectPanels = (projectId: string | undefined) =>
  useQuery({
    queryKey: keys.panels(projectId ?? ''),
    enabled: Boolean(projectId),
    queryFn: async (): Promise<ProjectPanels> => {
      const [runs, evidence] = await Promise.all([
        listProjectRuns(projectId!, { limit: 20 }),
        listProjectEvidence(projectId!, { limit: 20 }),
      ])
      return { runs: runs.data, evidence: evidence.data }
    },
  })
