'use client'

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from '@chakra-ui/react'
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode'
import { AlertDialogProvider } from './alert-dialog'

export function Provider(props: ColorModeProviderProps) {
  const config = defineConfig({
    globalCss: {
      '*': {
        touchAction: 'manipulation',
      },
    },
    theme: {
      recipes: {
        textarea: {
          defaultVariants: {
            size: 'lg',
          },
        },
        input: {
          defaultVariants: {
            size: 'lg',
          },
        },
      },
    },
  })
  const system = createSystem(defaultConfig, config)

  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} forcedTheme="light" enableSystem={false}>
        <AlertDialogProvider>{props.children}</AlertDialogProvider>
      </ColorModeProvider>
    </ChakraProvider>
  )
}
