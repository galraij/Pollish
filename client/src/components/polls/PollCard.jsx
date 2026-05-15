import { Text, Box, Group } from '@mantine/core'
import { useLang } from '../../i18n'
import './PollCard.css'

function PollCard({ poll, isActive, onClick }) {
  const { t } = useLang()
  // Card content renders in the direction of its assigned language
  const pollDir = poll.language === 'he' ? 'rtl' : 'ltr'

  return (
    <Box
      className={`poll-card ${isActive ? 'poll-card--active' : ''}`}
      p="sm"
      onClick={onClick}
      dir={pollDir}
    >
      <Text size="sm" fw={500} lineClamp={1}>{poll.title}</Text>
      <Group justify="space-between" mt={4}>
        <Text size="xs" c="dimmed">{poll.created_by}</Text>
        <Text size="xs" c="dimmed">
          {poll.totalVotes} {poll.totalVotes !== 1 ? t('votes') : t('vote')}
        </Text>
      </Group>
    </Box>
  )
}

export default PollCard
