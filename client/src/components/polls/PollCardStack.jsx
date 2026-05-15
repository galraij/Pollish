import { useState, useRef, useEffect, useCallback } from 'react'
import { Text, Center } from '@mantine/core'
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

  // Sync index when initialPollId or polls change (e.g. after creating a poll)
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

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) triggerSwipe(1, currentIndex - 1)
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < polls.length - 1) triggerSwipe(-1, currentIndex + 1)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentIndex, polls.length, isExiting])

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
      const swipedLeft = offset < 0
      if (swipedLeft && currentIndex < polls.length - 1) {
        triggerSwipe(-1, currentIndex + 1)
      } else if (!swipedLeft && currentIndex > 0) {
        triggerSwipe(1, currentIndex - 1)
      } else {
        setDragOffset(0)
      }
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

      {/* Counter */}
      <div className="card-stack__counter">
        <Text size="sm" c="dimmed">
          {currentIndex + 1} / {polls.length}
        </Text>
      </div>
    </div>
  )
}

export default PollCardStack
