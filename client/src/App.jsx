import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom'
import { AppShell, Group, Text, Box, ActionIcon, ScrollArea } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import PollForm from './components/polls/PollForm'
import PollView from './components/polls/PollView'
import PollCard from './components/polls/PollCard'
import { pollService } from './services/api'
import './App.css'

function App() {
  const location = useLocation()
  const isDirectPollUrl = location.pathname.startsWith('/poll/')
  const [panelOpen, setPanelOpen] = useState(!isDirectPollUrl)
  const [polls, setPolls] = useState([])

  const loadPolls = useCallback(async () => {
    try {
      const data = await pollService.getAll()
      setPolls(data)
    } catch (err) {
      console.error('Failed to load polls:', err)
    }
  }, [])

  useEffect(() => {
    loadPolls()
  }, [loadPolls])

  return (
    <AppShell header={{ height: 56 }} padding={0}>
      {/* ── Header ── */}
      <AppShell.Header>
        <Group h="100%" px="md">
          <Text
            size="xl"
            component="a"
            href="/"
            onClick={(e) => { e.preventDefault(); window.location.href = '/' }}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Text span fw={700}>Poll</Text>ish
          </Text>
        </Group>
      </AppShell.Header>

      {/* ── Body ── */}
      <AppShell.Main style={{ height: '100%' }}>
        <div className="app-layout">
          {/* ── Left Panel ── */}
          {panelOpen && (
            <aside className="side-panel">
              <Box className="create-poll-box" p="md">
                <PollFormWrapper onPollCreated={loadPolls} />
              </Box>

              <ScrollArea className="poll-list-scroll" type="auto">
                <Box p="md" className="poll-list">
                  {polls.length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center">No polls yet</Text>
                  ) : (
                    <PollListItems polls={polls} />
                  )}
                </Box>
              </ScrollArea>
            </aside>
          )}

          {/* ── Toggle Notch ── */}
          <div className="panel-toggle">
            <ActionIcon
              variant="default"
              size="md"
              onClick={() => setPanelOpen((o) => !o)}
              aria-label={panelOpen ? 'Hide panel' : 'Show panel'}
              className="toggle-btn"
            >
              {panelOpen ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />}
            </ActionIcon>
          </div>

          {/* ── Main Content ── */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={
                <Text c="dimmed">Create a poll or select one from the panel</Text>
              } />
              <Route path="/poll/:id" element={
                <PollViewRoute onPollUpdated={loadPolls} />
              } />
            </Routes>
          </main>
        </div>
      </AppShell.Main>
    </AppShell>
  )
}

/* Wrapper so PollForm can navigate after creation */
function PollFormWrapper({ onPollCreated }) {
  const navigate = useNavigate()

  const handleCreated = (poll) => {
    onPollCreated()
    navigate(`/poll/${poll.id}`)
  }

  return <PollForm onPollCreated={handleCreated} />
}

/* Renders PollCard list with navigation */
function PollListItems({ polls }) {
  const navigate = useNavigate()
  const params = useParams()
  const location = useLocation()

  // Extract current poll ID from URL
  const match = location.pathname.match(/\/poll\/(.+)/)
  const activePollId = match ? match[1] : null

  return (
    <>
      {polls.map((poll) => (
        <Box key={poll.id} mb="xs">
          <PollCard
            poll={poll}
            isActive={poll.id === activePollId}
            onClick={() => navigate(`/poll/${poll.id}`)}
          />
        </Box>
      ))}
    </>
  )
}

/* Route wrapper that extracts pollId from URL params */
function PollViewRoute({ onPollUpdated }) {
  const { id } = useParams()
  return <PollView pollId={id} onPollUpdated={onPollUpdated} />
}

export default App
