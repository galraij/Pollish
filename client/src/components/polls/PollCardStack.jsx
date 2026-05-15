import { useState, useRef, useEffect, useCallback } from 'react'
import { Text, Center, ActionIcon } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useLang } from '../../i18n'
import PollView from './PollView'
import './PollCardStack.css'

const SWIPE_THRESHOLD = 100

function PollCardStack({ polls, initialPollId, onPollUpdated, onIndexChange }) {
  const { t } = useLang()

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialPollId) {
      const idx = polls.findIndex((p) => p.id === initialPollId)
      return idx >= 0 ? idx : 0
    }
    return 0
  })

  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [exitDirection, setExitDirection] = useState(0)

  const startXRef = useRef(0)
  const draggingRef = useRef(false)
  const dragOffsetRef = useRef(0)

  // Sync index when initialPollId or polls change
  useEffect(() => {
    if (initialPollId && polls.length > 0) {
      const idx = polls.findIndex((p) => p.id === initialPollId)
      if (idx >= 0) setCurrentIndex(idx)
    }
  }, [initialPollId, polls])

  // Notify parent of index changes for URL updates
  useEffect(() => {
    if (polls[currentIndex] && onIndexChange) {
      onIndexChange(polls[currentIndex].id)
    }
  }, [currentIndex, polls, onIndexChange])

  // Looping helper: wraps index around the polls array
  const wrapIndex = useCallback((i) => {
    if (polls.length === 0) return 0
    return ((i % polls.length) + polls.length) % polls.length
  }, [polls.length])

  const triggerSwipe = useCallback((direction, newIndex) => {
    if (isExiting) return
    setExitDirection(direction)
    setIsExiting(true)
    setDragOffset(0)

    setTimeout(() => {
      setCurrentIndex(newIndex)
      setIsExiting(false)
      setExitDirection(0)
    }, 300)
  }, [isExiting])

  const goNext = useCallback(() => {
    triggerSwipe(-1, wrapIndex(currentIndex + 1))
  }, [currentIndex, triggerSwipe, wrapIndex])

  const goPrev = useCallback(() => {
    triggerSwipe(1, wrapIndex(currentIndex - 1))
  }, [currentIndex, triggerSwipe, wrapIndex])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev])

  // ── Touch handlers ──
  const handleTouchStart = (e) => {
    if (isExiting) return
    startXRef.current = e.touches[0].clientX
    draggingRef.current = true
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!draggingRef.current) return
    const delta = e.touches[0].clientX - startXRef.current
    dragOffsetRef.current = delta
    setDragOffset(delta)
  }

  const handleTouchEnd = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setIsDragging(false)
    resolveSwipe(dragOffsetRef.current)
  }

  // ── Mouse handlers ──
  const handleMouseDown = (e) => {
    if (isExiting) return
    e.preventDefault()
    startXRef.current = e.clientX
    draggingRef.current = true
    setIsDragging(true)

    const onMove = (ev) => {
      const delta = ev.clientX - startXRef.current
      dragOffsetRef.current = delta
      setDragOffset(delta)
    }

    const onUp = () => {
      draggingRef.current = false
      setIsDragging(false)
      resolveSwipe(dragOffsetRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── Resolve swipe direction ──
  const resolveSwipe = (offset) => {
    if (Math.abs(offset) > SWIPE_THRESHOLD) {
      if (offset < 0) goNext()
      else goPrev()
    } else {
      setDragOffset(0)
    }
  }

  // ── Empty state ──
  if (polls.length === 0) {
    return (
      <Center h="60vh">
        <Text c="dimmed" size="lg">{t('noMorePolls')}</Text>
      </Center>
    )
  }

  // ── If initialPollId not in filtered list, render standalone PollView ──
  if (initialPollId && !polls.find((p) => p.id === initialPollId)) {
    return (
      <Center className="card-stack">
        <div className="card-stack__card">
          <PollView pollId={initialPollId} onPollUpdated={onPollUpdated} />
        </div>
      </Center>
    )
  }

  const currentPoll = polls[currentIndex]

  // ── Card transform ──
  const getCardStyle = () => {
    if (isExiting) {
      return {
        transform: `translateX(${exitDirection * 120}vw) rotate(${exitDirection * 15}deg)`,
        transition: 'transform 0.3s ease-in',
      }
    }
    if (isDragging) {
      const rotation = dragOffset * 0.04
      return {
        transform: `translateX(${dragOffset}px) rotate(${rotation}deg)`,
        transition: 'none',
        cursor: 'grabbing',
      }
    }
    return {
      transform: 'translateX(0) rotate(0deg)',
      transition: 'transform 0.3s ease-out',
    }
  }

  return (
    <div className="card-stack">
      {/* Left arrow */}
      <ActionIcon
        variant="subtle"
        size="xl"
        className="card-stack__arrow card-stack__arrow--left"
        onClick={goPrev}
        aria-label={t('swipeToSkip')}
      >
        <IconChevronRight size={28} />
      </ActionIcon>

      <div
        className="card-stack__card"
        style={getCardStyle()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <PollView
          key={currentPoll.id}
          pollId={currentPoll.id}
          onPollUpdated={onPollUpdated}
        />
      </div>

      {/* Right arrow */}
      <ActionIcon
        variant="subtle"
        size="xl"
        className="card-stack__arrow card-stack__arrow--right"
        onClick={goNext}
        aria-label={t('swipeToSkip')}
      >
        <IconChevronLeft size={28} />
      </ActionIcon>
    </div>
  )
}

export default PollCardStack
