'use client'

import { SegmentGroup } from '@chakra-ui/react'
import { forwardRef } from 'react'

export interface SegmentedControlProps extends SegmentGroup.RootProps {
  items: Array<{
    value: string
    label: string
  }>
}

export const SegmentedControl = forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(function SegmentedControl(props, ref) {
  const { items, ...rest } = props
  return (
    <SegmentGroup.Root ref={ref} {...rest}>
      <SegmentGroup.Indicator />
      {items.map((item) => (
        <SegmentGroup.Item key={item.value} value={item.value}>
          {item.label}
        </SegmentGroup.Item>
      ))}
    </SegmentGroup.Root>
  )
})
