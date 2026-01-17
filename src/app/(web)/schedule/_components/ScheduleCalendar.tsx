'use client'

import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'next/navigation'
import { Box } from '@chakra-ui/react'
import EventCreatePopover from './EventCreatePopover'
import type { CalendarEvent } from '@/hooks/useEvent'

interface ScheduleCalendarProps {
  initialEvents: CalendarEvent[]
}

export default function ScheduleCalendar({
  initialEvents,
}: ScheduleCalendarProps) {
  const router = useRouter()

  const [popoverState, setPopoverState] = useState({
    isOpen: false,
    selectedDate: '',
    anchorPosition: { x: 0, y: 0 },
  })

  const handleDateClick = (arg: { dateStr: string; jsEvent: MouseEvent }) => {
    setPopoverState({
      isOpen: true,
      selectedDate: arg.dateStr,
      anchorPosition: {
        x: arg.jsEvent.clientX,
        y: arg.jsEvent.clientY,
      },
    })
  }

  const handleClosePopover = () => {
    setPopoverState((prev) => ({ ...prev, isOpen: false }))
  }

  const handleEventClick = (arg: { event: { id: string } }) => {
    router.push(`/schedule/event/${arg.event.id}`)
  }

  return (
    <Box>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={initialEvents}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek',
        }}
        locale="ko"
        buttonText={{
          today: '오늘',
          month: '월',
          week: '주',
        }}
      />

      <EventCreatePopover
        isOpen={popoverState.isOpen}
        onClose={handleClosePopover}
        selectedDate={popoverState.selectedDate}
        anchorPosition={popoverState.anchorPosition}
      />
    </Box>
  )
}
