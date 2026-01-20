'use client'

import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode'
import { AlertDialogProvider } from './alert-dialog'

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider {...props} forcedTheme="light" enableSystem={false}>
        <AlertDialogProvider>{props.children}</AlertDialogProvider>
      </ColorModeProvider>
    </ChakraProvider>
  )
}
