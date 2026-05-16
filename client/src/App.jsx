import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppShell, Group, Text, Button, ActionIcon, Modal } from '@mantine/core'
import { IconPlus, IconLogin, IconLogout } from '@tabler/icons-react'
import PollForm from './components/polls/PollForm'
import PollCardStack from './components/polls/PollCardStack'
import LoginModal from './LoginModal'
import { pollService } from './services/api'
import { useLang } from './i18n'
import { useAuth } from './AuthContext'
import './App.css'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [polls, setPolls] = useState([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const { lang, setLang, t, dir } = useLang()
  const { currentUser, logout, loginModalOpened, openLoginModal, closeLoginModal } = useAuth()

  // Extract poll ID from URL
  const match = location.pathname.match(/\/poll\/(.+)/)
  const directPollId = match ? match[1] : null

  const loadPolls = useCallback(async () => {
    try {
      const data = await pollService.getAll(lang)
      setPolls(data)
    } catch (err) {
      console.error('Failed to load polls:', err)
    }
  }, [lang])

  useEffect(() => {
    loadPolls()
  }, [loadPolls])

  const toggleLang = () => {
    setLang(lang === 'en' ? 'he' : 'en')
  }

  const handlePollCreated = (poll) => {
    setCreateModalOpen(false)
    loadPolls()
    navigate(`/poll/${poll.id}`, { replace: true })
  }

  const handleIndexChange = useCallback((pollId) => {
    navigate(`/poll/${pollId}`, { replace: true })
  }, [navigate])

  return (
    <AppShell header={{ height: 56 }} padding={0} dir={dir}>
      {/* ── Header ── */}
      <AppShell.Header>
        <Group className="app-header-content" h="100%" px="md" justify="space-between">
          <Text
            size="xl"
            component="a"
            href="/"
            onClick={(e) => { e.preventDefault(); navigate('/', { replace: true }); }}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {lang === 'en' ? (
              <><Text span fw={700}>Poll</Text>ish</>
            ) : (
              <Text span fw={700}>{t('appName')}</Text>
            )}
          </Text>

          <Group gap="xs">
            <ActionIcon
              variant="filled"
              size="md"
              onClick={() => setCreateModalOpen(true)}
              aria-label={t('createPoll')}
              className="create-btn"
            >
              <IconPlus size={18} />
            </ActionIcon>

            {currentUser ? (
              <ActionIcon variant="light" color="red" onClick={logout} title="Logout">
                <IconLogout size={18} />
              </ActionIcon>
            ) : (
              <ActionIcon variant="light" color="blue" onClick={openLoginModal} title="Login">
                <IconLogin size={18} />
              </ActionIcon>
            )}

            <Button
              variant="subtle"
              size="compact-sm"
              onClick={toggleLang}
              className="lang-toggle"
            >
              {t('toggleLang')}
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      {/* ── Body ── */}
      <AppShell.Main style={{ height: '100%' }}>
        <div className="app-layout" dir={dir}>
          <PollCardStack
            polls={polls}
            initialPollId={directPollId}
            onPollUpdated={loadPolls}
            onIndexChange={handleIndexChange}
          />
        </div>
      </AppShell.Main>

      {/* ── Create Poll Modal ── */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t('createPoll')}
        size="md"
        centered
        dir={dir}
      >
        <div dir={dir}>
          <PollForm onPollCreated={handlePollCreated} />
        </div>
      </Modal>

      {/* ── Login Modal ── */}
      <LoginModal opened={loginModalOpened} onClose={closeLoginModal} />
    </AppShell>
  )
}

export default App
