'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'next/navigation'
import { useEvents, useCreateEvent } from '@/hooks/useEvent'

export default function ManagementSchedulerPage() {
  const router = useRouter()
  const { data: events = [] } = useEvents()
  const createEvent = useCreateEvent()

  const handleDateClick = (arg: { dateStr: string }) => {
    const dateStr = arg.dateStr
    const title = prompt('일정 제목을 입력하세요:')
    if (title) {
      createEvent.mutate({ id: crypto.randomUUID(), title, start: dateStr })
    }
  }

  const handleEventClick = (arg: { event: { id: string } }) => {
    // 상세 화면으로 이동
    router.push(`/calendar/event/${arg.event.id}`)
  }

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
      />
    </div>
  )
}
