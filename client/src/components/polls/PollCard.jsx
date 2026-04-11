import { Text, Box, Group } from '@mantine/core'
import './PollCard.css'

function PollCard({ poll, isActive, onClick }) {
  return (
    <Box
      className={`poll-card ${isActive ? 'poll-card--active' : ''}`}
      p="sm"
      onClick={onClick}
    >
      <Text size="sm" fw={500} lineClamp={1}>{poll.title}</Text>
      <Group justify="space-between" mt={4}>
        <Text size="xs" c="dimmed">{poll.created_by}</Text>
        <Text size="xs" c="dimmed">{poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}</Text>
      </Group>
    </Box>
  )
}

export default PollCard
