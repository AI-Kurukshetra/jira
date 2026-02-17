import { Box } from '@mui/material'

import { BacklogView } from '@/components/backlog/BacklogView'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default function BacklogPage() {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Backlog" subtitle="Plan upcoming sprints and priorities." />
      <BacklogView />
    </Box>
  )
}
