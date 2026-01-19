'use client'

import { Tabs } from '@chakra-ui/react'
import { LuUser, LuCalendarX } from 'react-icons/lu'
import MemberForm from './MemberForm'
import MemberAbsenceList from './MemberAbsenceList'
import type { MemberWithRole } from '@/domains/member/member.model'

interface MemberTabsProps {
  initialData: MemberWithRole
  isAdmin: boolean
}

export default function MemberTabs({ initialData, isAdmin }: MemberTabsProps) {
  return (
    <Tabs.Root defaultValue="profile" variant="line">
      <Tabs.List>
        <Tabs.Trigger value="profile">
          <LuUser />
          프로필
        </Tabs.Trigger>
        <Tabs.Trigger value="absence">
          <LuCalendarX />
          지각/불참 기록
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="profile">
        <MemberForm initialData={initialData} />
      </Tabs.Content>

      <Tabs.Content value="absence">
        <MemberAbsenceList memberSeq={initialData.seq} isAdmin={isAdmin} />
      </Tabs.Content>
    </Tabs.Root>
  )
}
