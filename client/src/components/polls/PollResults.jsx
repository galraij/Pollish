import { Text, Stack, Progress, Group, Box } from '@mantine/core'
import { useLang } from '../../i18n'
import './PollResults.css'

function PollResults({ options, totalVotes, votedOptionId, pollLanguage }) {
  const { t } = useLang()

  return (
    <Stack gap="xs">
      {options.map((opt) => {
        const pct = totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0
        const isVoted = opt.id === votedOptionId

        return (
          <Box key={opt.id} className={`result-row ${isVoted ? 'result-row--voted' : ''}`}>
            <Group justify="space-between" mb={4}>
              <Text size="sm" fw={isVoted ? 600 : 400}>{opt.text}</Text>
              <Text size="sm" c="dimmed">{opt.vote_count} ({pct}%)</Text>
            </Group>
            <Progress
              value={pct}
              size="md"
              radius="sm"
              color={isVoted ? 'blue' : 'gray'}
            />
          </Box>
        )
      })}
      <Text size="xs" c="dimmed" ta={pollLanguage === 'he' ? 'left' : 'right'} mt="xs">
        {totalVotes} {totalVotes !== 1 ? t('totalVotes') : t('totalVote')}
      </Text>
    </Stack>
  )
}

export default PollResults
