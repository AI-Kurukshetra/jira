'use client'

import { Box, Skeleton } from '@mui/material'

interface LoadingSkeletonProps {
  rows?: number
  height?: number
}

export function LoadingSkeleton({ rows = 3, height = 18 }: LoadingSkeletonProps) {
  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" height={height} />
      ))}
    </Box>
  )
}
