import { Box, Card, CardContent, MenuItem, TextField, Typography } from '@mui/material'

import { SectionHeader } from '@/components/ui/SectionHeader'

export default function ProjectSettingsPage() {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Project Settings" subtitle="Update project details and preferences." />
      <Card>
        <CardContent sx={{ display: 'grid', gap: 2, maxWidth: 520 }}>
          <Typography variant="h3">General</Typography>
          <TextField label="Project Name" defaultValue="ProjectHub Core" />
          <TextField label="Project Key" defaultValue="PROJ" />
          <TextField select label="Project Type" defaultValue="software">
            <MenuItem value="software">Software</MenuItem>
            <MenuItem value="business">Business</MenuItem>
            <MenuItem value="ops">Ops</MenuItem>
          </TextField>
          <TextField label="Description" multiline minRows={3} defaultValue="Core platform workstreams" />
        </CardContent>
      </Card>
    </Box>
  )
}
