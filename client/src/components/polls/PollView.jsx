import { useState, useEffect, useCallback } from 'react'
import { Text, Stack, Radio, Card, Loader, Center, Box } from '@mantine/core'
import { pollService, voteService } from '../../services/api'
import PollResults from './PollResults'
import SharePoll from './SharePoll'
import './PollView.css'

function PollView({ pollId, onPollUpdated }) {
  const [poll, setPoll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [votedOptionId, setVotedOptionId] = useState(null)
  const [voting, setVoting] = useState(false)

  const loadPoll = useCallback(async () => {
    try {
      const [pollData, voteCheck] = await Promise.all([
        pollService.getById(pollId),
        voteService.check(pollId),
      ])
      setPoll(pollData)
      setHasVoted(voteCheck.hasVoted)
      setVotedOptionId(voteCheck.votedOptionId)
    } catch (err) {
      console.error('Failed to load poll:', err)
    } finally {
      setLoading(false)
    }
  }, [pollId])

  useEffect(() => {
    setLoading(true)
    loadPoll()
  }, [loadPoll])

  const handleVote = async (optionId) => {
    if (hasVoted || voting) return
    setVoting(true)
    try {
      const updatedPoll = await voteService.cast({ pollId, optionId })
      setPoll(updatedPoll)
      setHasVoted(true)
      setVotedOptionId(optionId)
      if (onPollUpdated) onPollUpdated()
    } catch (err) {
      console.error('Failed to vote:', err)
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return <Center h={200}><Loader /></Center>
  }

  if (!poll) {
    return <Text c="dimmed" ta="center">Poll not found</Text>
  }

  return (
    <Card className="poll-view" shadow="sm" radius="md" withBorder p="lg" maw={560} w="100%">
      <Stack gap="md">
        <Box>
          <Text size="lg" fw={600}>{poll.title}</Text>
          <Text size="xs" c="dimmed">by {poll.created_by}</Text>
        </Box>

        <Text size="md">{poll.question}</Text>

        {hasVoted ? (
          <PollResults
            options={poll.options}
            totalVotes={poll.totalVotes}
            votedOptionId={votedOptionId}
          />
        ) : (
          <Stack gap="xs">
            {poll.options.map((opt) => (
              <Box
                key={opt.id}
                className="vote-option"
                onClick={() => handleVote(opt.id)}
              >
                <Radio
                  value={opt.id}
                  label={opt.text}
                  checked={false}
                  readOnly
                  disabled={voting}
                  className="vote-radio"
                />
              </Box>
            ))}
          </Stack>
        )}

        <SharePoll pollId={pollId} />
      </Stack>
    </Card>
  )
}

export default PollView
