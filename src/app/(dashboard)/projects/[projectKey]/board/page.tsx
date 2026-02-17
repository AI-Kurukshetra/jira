import { Box } from '@mui/material'

import { KanbanBoard } from '@/components/board/KanbanBoard'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default function BoardPage() {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Board" subtitle="Drag issues across your workflow." />
      <KanbanBoard />
    </Box>
  )
}
