import { useState } from 'react'
import { AppShell, Group, Text, Box, ActionIcon, ScrollArea } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import './App.css'

function App() {
  const [panelOpen, setPanelOpen] = useState(true)

  return (
    <AppShell
      header={{ height: 56 }}
      padding={0}
    >
      {/* ── Header ── */}
      <AppShell.Header>
        <Group h="100%" px="md">
          <Text size="xl" component="span">
            <Text span fw={700}>Poll</Text>ish
          </Text>
        </Group>
      </AppShell.Header>

      {/* ── Body ── */}
      <AppShell.Main style={{ height: '100%' }}>
        <div className="app-layout">
          {/* ── Left Panel (1/3) ── */}
          {panelOpen && (
            <aside className="side-panel">
              {/* Fixed poll creation box */}
              <Box className="create-poll-box" p="md">
                <Text c="dimmed">[Poll Creation Form Placeholder]</Text>
              </Box>

              {/* Scrollable poll list */}
              <ScrollArea className="poll-list-scroll" type="auto">
                <Box p="md" className="poll-list">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Box key={i} className="poll-list-item" p="sm" mb="xs">
                      <Text size="sm" c="dimmed">
                        [Poll Card Placeholder #{i + 1}]
                      </Text>
                    </Box>
                  ))}
                </Box>
              </ScrollArea>
            </aside>
          )}

          {/* ── Panel Toggle Notch ── */}
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

          {/* ── Main Content (remaining space) ── */}
          <main className="main-content">
            <Text c="dimmed">[Main Content Area Placeholder]</Text>
          </main>
        </div>
      </AppShell.Main>
    </AppShell>
  )
}

export default App
