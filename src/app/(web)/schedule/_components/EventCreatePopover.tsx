'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Field,
  Flex,
  Input,
  Popover,
  Portal,
  Stack,
  Textarea,
} from '@chakra-ui/react'
import { useCreateEvent, type CreateEventInput } from '@/hooks/useEvent'
import { toaster } from '@/components/ui/toaster'
import { withMask } from 'use-mask-input'

interface EventCreatePopoverProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
  anchorPosition: { x: number; y: number }
}

export default function EventCreatePopover({
  isOpen,
  onClose,
  selectedDate,
  anchorPosition,
}: EventCreatePopoverProps) {
  const createEvent = useCreateEvent()

  const [formData, setFormData] = useState<CreateEventInput>({
    title: '',
    description: '',
    start_datetime: '09:00',
    end_datetime: '11:00',
    location_name: '',
    location_url: '',
    max_participants: 8,
  })

  const handleInputChange = (
    field: keyof CreateEventInput,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toaster.error({ title: '제목을 입력해주세요.' })
      return
    }

    try {
      console.log(formData.start_datetime)
      await createEvent.mutateAsync({
        ...formData,
        start_datetime: new Date(
          `${selectedDate}T${formData.start_datetime}:00+09:00`
        ).toISOString(),
        end_datetime: new Date(
          `${selectedDate}T${formData.end_datetime}:00+09:00`
        ).toISOString(),
      })
      toaster.success({ title: '일정이 등록되었습니다.' })
      onClose()
      resetForm()
    } catch {
      toaster.error({ title: '일정 등록에 실패했습니다.' })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_datetime: '09:00',
      end_datetime: '11:00',
      location_name: '',
      location_url: '',
      max_participants: 8,
    })
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
      <Popover.Anchor asChild>
        <Box
          position="fixed"
          left={`${anchorPosition.x}px`}
          top={`${anchorPosition.y}px`}
          width="1px"
          height="1px"
        />
      </Popover.Anchor>
      <Portal>
        <Popover.Positioner>
          <Popover.Content width="360px" style={{ overflow: 'auto' }}>
            <Popover.Arrow>
              <Popover.ArrowTip />
            </Popover.Arrow>
            <Popover.Header>
              <Popover.Title>일정 등록</Popover.Title>
              <Popover.Description>{selectedDate}</Popover.Description>
            </Popover.Header>
            <Popover.Body>
              <Stack gap={3}>
                <Field.Root required>
                  <Field.Label>제목</Field.Label>
                  <Input
                    placeholder="일정 제목"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </Field.Root>

                {/* <Field.Root>
                  <Field.Label>설명</Field.Label>
                  <Textarea
                    placeholder="일정 설명"
                    value={formData.description || ''}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    rows={2}
                  />
                </Field.Root> */}

                <Flex gap={3}>
                  <Field.Root flex={1}>
                    <Field.Label>시작 시간</Field.Label>
                    <Input
                      type="time"
                      value={formData.start_datetime}
                      onChange={(e) =>
                        handleInputChange('start_datetime', e.target.value)
                      }
                    />
                  </Field.Root>
                  <Field.Root flex={1}>
                    <Field.Label>종료 시간</Field.Label>
                    <Input
                      type="time"
                      value={formData.end_datetime}
                      onChange={(e) =>
                        handleInputChange('end_datetime', e.target.value)
                      }
                    />
                  </Field.Root>
                </Flex>

                <Field.Root>
                  <Field.Label>장소</Field.Label>
                  <Input
                    placeholder="장소명"
                    value={formData.location_name || ''}
                    onChange={(e) =>
                      handleInputChange('location_name', e.target.value)
                    }
                  />
                  <Input
                    placeholder="장소 URL"
                    value={formData.location_url || ''}
                    onChange={(e) =>
                      handleInputChange('location_url', e.target.value)
                    }
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>최대 인원</Field.Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.max_participants}
                    onChange={(e) =>
                      handleInputChange(
                        'max_participants',
                        parseInt(e.target.value) || 1
                      )
                    }
                  />
                </Field.Root>
              </Stack>
            </Popover.Body>
            <Popover.Footer>
              <Flex gap={2} justify="flex-end">
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  취소
                </Button>
                <Button
                  colorPalette="blue"
                  size="sm"
                  onClick={handleSubmit}
                  loading={createEvent.isPending}
                >
                  등록
                </Button>
              </Flex>
            </Popover.Footer>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}
