'use client'

import { useEffect, useRef, useCallback } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

interface QuillEditorProps {
  value?: string
  onChange?: (content: string) => void
  placeholder?: string
}

export default function QuillEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
}: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)
  const isInitializedRef = useRef(false)

  // onChange를 useCallback으로 감싸서 안정적인 참조 유지
  const handleChange = useCallback(
    (content: string) => {
      onChange?.(content)
    },
    [onChange]
  )

  // Quill 인스턴스 초기화 (한 번만 실행)
  useEffect(() => {
    if (!editorRef.current || isInitializedRef.current) return

    isInitializedRef.current = true

    // Quill 인스턴스 생성
    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ['link', 'image'],
          ['clean'],
        ],
      },
    })

    quillRef.current = quill

    // 초기값 설정
    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value)
    }

    // 변경 이벤트 핸들러
    const handleTextChange = () => {
      const content = quill.root.innerHTML
      handleChange(content)
    }

    quill.on('text-change', handleTextChange)

    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change', handleTextChange)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // value prop이 외부에서 변경될 때 업데이트
  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const currentContent = quillRef.current.root.innerHTML
      if (currentContent !== value) {
        quillRef.current.clipboard.dangerouslyPasteHTML(value)
      }
    }
  }, [value])

  return (
    <div>
      <div
        ref={editorRef}
        style={{ minHeight: '300px', backgroundColor: 'white' }}
      />
    </div>
  )
}
