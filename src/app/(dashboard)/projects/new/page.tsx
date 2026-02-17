'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Card, CardContent, MenuItem, TextField, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useRouter } from 'next/navigation'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { projectSchema } from '@/lib/validations/schemas'
import { apiPost } from '@/lib/api/client'
import type { Project } from '@/lib/types'
import type { z } from 'zod'

type ProjectValues = z.infer<typeof projectSchema>

const KEY_MAX = 10
const KEY_MIN = 2
const KEY_REGEX = /[^a-zA-Z0-9]/g

const buildProjectKey = (name: string) => {
  const normalized = name.replace(KEY_REGEX, '').toUpperCase()
  const candidate = normalized.slice(0, KEY_MAX)
  return candidate.length >= KEY_MIN ? candidate : ''
}

export default function NewProjectPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [keyEdited, setKeyEdited] = useState(false)

  const { register, handleSubmit, setValue, control, formState } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      key: '',
      projectType: 'software',
      description: ''
    }
  })

  const name = useWatch({ control, name: 'name' })
  const autoKey = useMemo(() => buildProjectKey(name ?? ''), [name])

  useEffect(() => {
    if (!keyEdited) {
      setValue('key', autoKey)
    }
  }, [autoKey, keyEdited, setValue])

  const createProject = useMutation({
    mutationFn: async (values: ProjectValues) => {
      const result = await apiPost<Project, ProjectValues>('/api/projects', values)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
      router.push(`/projects/${project.key}`)
    }
  })

  const onSubmit = (values: ProjectValues) => {
    createProject.mutate(values)
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader title="Create Project" subtitle="Set up a new workspace for your team." />
      <Card>
        <CardContent sx={{ display: 'grid', gap: 2, maxWidth: 520 }}>
          <TextField
            label="Project Name"
            placeholder="Jira Bacancy"
            {...register('name')}
            error={Boolean(formState.errors.name)}
            helperText={formState.errors.name?.message}
          />
          <TextField
            label="Project Key"
            placeholder="PROJ"
            {...register('key', {
              onChange: () => setKeyEdited(true)
            })}
            error={Boolean(formState.errors.key)}
            helperText={formState.errors.key?.message ?? '2-10 uppercase characters'}
          />
          <TextField select label="Project Type" defaultValue="software" {...register('projectType')}>
            <MenuItem value="software">Software</MenuItem>
            <MenuItem value="business">Business</MenuItem>
            <MenuItem value="ops">Ops</MenuItem>
          </TextField>
          <TextField
            label="Description"
            multiline
            minRows={3}
            placeholder="Describe the project's mission."
            {...register('description')}
            error={Boolean(formState.errors.description)}
            helperText={formState.errors.description?.message}
          />
          {createProject.isError && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {createProject.error?.message ?? 'Failed to create project.'}
            </Typography>
          )}
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit(onSubmit)}
            disabled={createProject.isPending}
          >
            {createProject.isPending ? 'Creating...' : 'Create Project'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}
