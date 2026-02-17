import { Box, Button, Card, CardContent, MenuItem, TextField } from '@mui/material'

import { SectionHeader } from '@/components/ui/SectionHeader'

export default function NewProjectPage() {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader title="Create Project" subtitle="Set up a new workspace for your team." />
      <Card>
        <CardContent sx={{ display: 'grid', gap: 2, maxWidth: 520 }}>
          <TextField label="Project Name" placeholder="ProjectHub" />
          <TextField label="Project Key" placeholder="PROJ" />
          <TextField select label="Project Type" defaultValue="software">
            <MenuItem value="software">Software</MenuItem>
            <MenuItem value="business">Business</MenuItem>
            <MenuItem value="ops">Ops</MenuItem>
          </TextField>
          <TextField label="Description" multiline minRows={3} placeholder="Describe the project's mission." />
          <Button variant="contained" size="large">Create Project</Button>
        </CardContent>
      </Card>
    </Box>
  )
}
