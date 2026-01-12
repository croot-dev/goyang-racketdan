'use client'

import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  title: string
  start: string
  end?: string
  description?: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const router = useRouter()

  useEffect(() => {
    // 초기 이벤트 로드
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => setEvents(data))
  }, [])

  const handleDateClick = (arg: { dateStr: string }) => {
    const dateStr = arg.dateStr
    // 간단 툴팁 또는 모달을 열고 일정 등록 가능
    const title = prompt('일정 제목을 입력하세요:')
    if (title) {
      const newEvent = { id: crypto.randomUUID(), title, start: dateStr }
      fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(newEvent),
        headers: { 'Content-Type': 'application/json' },
      }).then(() => setEvents([...events, newEvent]))
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
