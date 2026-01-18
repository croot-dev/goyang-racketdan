'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { Button, Dialog, Portal, Text } from '@chakra-ui/react'

interface AlertDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  showCancel?: boolean
}

interface AlertDialogContextType {
  alert: (options: AlertDialogOptions) => void
  confirm: (options: AlertDialogOptions) => Promise<boolean>
}

const AlertDialogContext = createContext<AlertDialogContextType | null>(null)

export function useAlertDialog() {
  const context = useContext(AlertDialogContext)
  if (!context) {
    throw new Error('useAlertDialog must be used within AlertDialogProvider')
  }
  return context
}

interface AlertDialogProviderProps {
  children: ReactNode
}

export function AlertDialogProvider({ children }: AlertDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<AlertDialogOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null)

  const alert = useCallback((opts: AlertDialogOptions) => {
    setOptions({ ...opts, showCancel: false })
    setIsOpen(true)
  }, [])

  const confirm = useCallback((opts: AlertDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions({ ...opts, showCancel: true })
      setResolvePromise(() => resolve)
      setIsOpen(true)
    })
  }, [])

  const handleConfirm = () => {
    setIsOpen(false)
    options?.onConfirm?.()
    resolvePromise?.(true)
    setResolvePromise(null)
  }

  const handleCancel = () => {
    setIsOpen(false)
    options?.onCancel?.()
    resolvePromise?.(false)
    setResolvePromise(null)
  }

  return (
    <AlertDialogContext.Provider value={{ alert, confirm }}>
      {children}
      <Dialog.Root
        open={isOpen}
        closeOnEscape={false}
        closeOnInteractOutside={false}
        onExitComplete={() => {
          handleCancel()
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{options?.title}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text>{options?.message}</Text>
              </Dialog.Body>
              <Dialog.Footer gap={2}>
                {options?.showCancel && (
                  <Button variant="outline" onClick={handleCancel}>
                    {options?.cancelText || '취소'}
                  </Button>
                )}
                <Button colorPalette="blue" onClick={handleConfirm}>
                  {options?.confirmText || '확인'}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </AlertDialogContext.Provider>
  )
}
