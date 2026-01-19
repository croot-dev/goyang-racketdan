'use client'

import { useEffect } from 'react'
import {
  Button,
  Dialog,
  Field,
  Flex,
  Input,
  Portal,
  Stack,
  Textarea,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useUpdateEvent } from '@/hooks/useEvent'
import { toaster } from '@/components/ui/toaster'
import type { EventWithHost } from '@/domains/event/event.model'

interface EventEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EventWithHost
}

interface FormValues {
  title: string
  description: string
  start_date: string
  start_time: string
  end_time: string
  location_name: string
  location_url: string
  max_participants: number
}

export default function EventEditDialog({
  open,
  onOpenChange,
  event,
}: EventEditDialogProps) {
  const updateEvent = useUpdateEvent()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>()

  useEffect(() => {
    if (open && event) {
      const startDate = new Date(event.start_datetime)
      const endDate = new Date(event.end_datetime)

      reset({
        title: event.title,
        description: event.description || '',
        start_date: startDate.toISOString().split('T')[0],
        start_time: startDate.toTimeString().slice(0, 5),
        end_time: endDate.toTimeString().slice(0, 5),
        location_name: event.location_name || '',
        location_url: event.location_url || '',
        max_participants: event.max_participants,
      })
    }
  }, [open, event, reset])

  const handleClose = () => {
    onOpenChange(false)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateEvent.mutateAsync({
        id: event.id,
        title: data.title,
        description: data.description || undefined,
        start_datetime: new Date(
          `${data.start_date}T${data.start_time}:00+09:00`
        ).toISOString(),
        end_datetime: new Date(
          `${data.start_date}T${data.end_time}:00+09:00`
        ).toISOString(),
        location_name: data.location_name || undefined,
        location_url: data.location_url || undefined,
        max_participants: data.max_participants,
      })
      toaster.success({ title: '일정이 수정되었습니다.' })
      handleClose()
    } catch {
      toaster.error({ title: '일정 수정에 실패했습니다.' })
    }
  })

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>일정 수정</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Field.Root invalid={!!errors.title} required>
                  <Field.Label>제목</Field.Label>
                  <Input
                    placeholder="일정 제목"
                    {...register('title', { required: '제목을 입력해주세요' })}
                  />
                  <Field.ErrorText>{errors.title?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>날짜</Field.Label>
                  <Input type="date" {...register('start_date')} />
                </Field.Root>

                <Flex gap={3}>
                  <Field.Root flex={1}>
                    <Field.Label>시작 시간</Field.Label>
                    <Input type="time" {...register('start_time')} />
                  </Field.Root>
                  <Field.Root flex={1}>
                    <Field.Label>종료 시간</Field.Label>
                    <Input type="time" {...register('end_time')} />
                  </Field.Root>
                </Flex>

                <Field.Root>
                  <Field.Label>장소</Field.Label>
                  <Input
                    placeholder="장소명"
                    {...register('location_name')}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>장소 URL</Field.Label>
                  <Input
                    placeholder="https://..."
                    {...register('location_url')}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>상세 설명</Field.Label>
                  <Textarea
                    placeholder="일정 설명"
                    rows={3}
                    {...register('description')}
                  />
                </Field.Root>

                <Field.Root invalid={!!errors.max_participants} required>
                  <Field.Label>최대 인원</Field.Label>
                  <Input
                    type="number"
                    min={1}
                    {...register('max_participants', {
                      required: '최대 인원을 입력해주세요',
                      valueAsNumber: true,
                      min: { value: 1, message: '최소 1명 이상이어야 합니다' },
                    })}
                  />
                  <Field.ErrorText>
                    {errors.max_participants?.message}
                  </Field.ErrorText>
                  <Field.HelperText>
                    현재 참석자({event.current_participants}명)보다 적게 설정하면 늦게 참석한 사람이 대기로 변경됩니다.
                  </Field.HelperText>
                </Field.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button
                colorPalette="blue"
                onClick={onSubmit}
                loading={updateEvent.isPending}
              >
                수정
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
