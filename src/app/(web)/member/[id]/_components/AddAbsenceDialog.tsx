'use client'

import { useState } from 'react'
import {
  Button,
  Dialog,
  Field,
  Input,
  NativeSelect,
  Portal,
  Stack,
  Textarea,
  SegmentGroup,
} from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { useEvents } from '@/hooks/useEvent'
import { useCreateEventAbsence } from '@/hooks/useEventAbsence'
import { AbsenceType } from '@/domains/event_absence/event_absence.model'
import { toaster } from '@/components/ui/toaster'

interface AddAbsenceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberSeq: number
}

interface FormValues {
  event_id: string
  absence_type: 'LATE' | 'NO_SHOW'
  reason: string
  late_minutes: string
}

const ABSENCE_TYPE_OPTIONS = [
  { value: AbsenceType.LATE, label: '지각' },
  { value: AbsenceType.NO_SHOW, label: '불참' },
]

export default function AddAbsenceDialog({
  open,
  onOpenChange,
  memberSeq,
}: AddAbsenceDialogProps) {
  const { data: events, isLoading: eventsLoading } = useEvents(1, 100)
  const createAbsence = useCreateEventAbsence()

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      event_id: '',
      absence_type: AbsenceType.LATE,
      reason: '',
      late_minutes: '',
    },
  })

  const absenceType = watch('absence_type')

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  const onSubmit = handleSubmit(async (data) => {
    if (!data.event_id) {
      toaster.create({
        title: '입력 오류',
        description: '이벤트를 선택해주세요.',
        type: 'error',
      })
      return
    }

    if (!data.reason.trim()) {
      toaster.create({
        title: '입력 오류',
        description: '사유를 입력해주세요.',
        type: 'error',
      })
      return
    }

    if (data.absence_type === AbsenceType.LATE && !data.late_minutes) {
      toaster.create({
        title: '입력 오류',
        description: '지각 시간을 입력해주세요.',
        type: 'error',
      })
      return
    }

    createAbsence.mutate(
      {
        event_id: parseInt(data.event_id),
        member_seq: memberSeq,
        absence_type: data.absence_type,
        reason: data.reason,
        late_minutes:
          data.absence_type === AbsenceType.LATE
            ? parseInt(data.late_minutes)
            : undefined,
      },
      {
        onSuccess: () => {
          toaster.create({
            title: '등록 완료',
            description: '지각/불참 기록이 등록되었습니다.',
            type: 'success',
          })
          handleClose()
        },
        onError: (error: Error) => {
          toaster.create({
            title: '등록 실패',
            description: error.message || '기록 등록 중 오류가 발생했습니다.',
            type: 'error',
          })
        },
      }
    )
  })

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>지각/불참 기록 추가</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                {/* 이벤트 선택 */}
                <Field.Root invalid={!!errors.event_id} required>
                  <Field.Label>이벤트</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      {...register('event_id', {
                        required: '이벤트를 선택해주세요',
                      })}
                      disabled={eventsLoading}
                    >
                      <option value="">이벤트를 선택하세요</option>
                      {events?.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title} (
                          {new Date(event.start_datetime).toLocaleDateString(
                            'ko-KR'
                          )}
                          )
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                  <Field.ErrorText>{errors.event_id?.message}</Field.ErrorText>
                </Field.Root>

                {/* 유형 선택 */}
                <Field.Root required>
                  <Field.Label>유형</Field.Label>
                  <Controller
                    name="absence_type"
                    control={control}
                    render={({ field }) => (
                      <SegmentGroup.Root
                        value={field.value}
                        onValueChange={(details) => {
                          details.value && field.onChange(details.value)
                        }}
                      >
                        <SegmentGroup.Indicator />
                        <SegmentGroup.Items items={ABSENCE_TYPE_OPTIONS} />
                      </SegmentGroup.Root>
                    )}
                  />
                </Field.Root>

                {/* 지각 시간 (지각인 경우만) */}
                {absenceType === AbsenceType.LATE && (
                  <Field.Root invalid={!!errors.late_minutes} required>
                    <Field.Label>지각 시간 (분)</Field.Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="예: 15"
                      {...register('late_minutes', {
                        required:
                          absenceType === AbsenceType.LATE
                            ? '지각 시간을 입력해주세요'
                            : false,
                        min: {
                          value: 1,
                          message: '1분 이상 입력해주세요',
                        },
                      })}
                    />
                    <Field.ErrorText>
                      {errors.late_minutes?.message}
                    </Field.ErrorText>
                  </Field.Root>
                )}

                {/* 사유 */}
                <Field.Root invalid={!!errors.reason} required>
                  <Field.Label>사유</Field.Label>
                  <Textarea
                    placeholder="지각/불참 사유를 입력해주세요"
                    rows={3}
                    {...register('reason', {
                      required: '사유를 입력해주세요',
                    })}
                  />
                  <Field.ErrorText>{errors.reason?.message}</Field.ErrorText>
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
                loading={createAbsence.isPending}
              >
                등록
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
