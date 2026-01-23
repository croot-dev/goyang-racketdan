import { Text, type TextProps } from '@chakra-ui/react'
import { MEMBER_GENDER, type MemberGender } from '@/constants'

interface ParticipantItemProps extends TextProps {
  nickname: string
  gender?: MemberGender | null
}

export default function ParticipantItem({
  nickname,
  gender,
  ...textProps
}: ParticipantItemProps) {
  const genderIcon =
    gender === MEMBER_GENDER.MALE
      ? ' 🚹'
      : gender === MEMBER_GENDER.FEMALE
        ? ' 🚺'
        : ' ❔'

  return (
    <Text {...textProps}>
      {nickname}
      {genderIcon && <span>{genderIcon}</span>}
    </Text>
  )
}
