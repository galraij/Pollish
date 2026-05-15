import { useState, useEffect, useCallback } from 'react'
import { Text, Stack, Radio, Checkbox, Card, Loader, Center, Box, Button } from '@mantine/core'
import { pollService, voteService } from '../../services/api'
import { useLang } from '../../i18n'
import PollResults from './PollResults'
import SharePoll from './SharePoll'
import './PollView.css'

function PollView({ pollId, onPollUpdated }) {
  const { t, setLang } = useLang()
  const [poll, setPoll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [votedOptionIds, setVotedOptionIds] = useState([])
  const [voting, setVoting] = useState(false)

  // For multiple choice polls
  const [selectedOptions, setSelectedOptions] = useState([])

  const loadPoll = useCallback(async () => {
    try {
      const [pollData, voteCheck] = await Promise.all([
        pollService.getById(pollId),
        voteService.check(pollId),
      ])
      setPoll(pollData)
      setHasVoted(voteCheck.hasVoted)
      setVotedOptionIds(voteCheck.votedOptionIds || [])
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

  useEffect(() => {
    if (poll?.language) {
      setLang(poll.language)
    }
  }, [poll?.language, setLang])

  const handleVoteSingle = async (optionId) => {
    if (hasVoted || voting) return
    submitVote([optionId])
  }

  const handleVoteMultipleSubmit = async () => {
    if (hasVoted || voting) return
    if (selectedOptions.length < poll.min_selections || selectedOptions.length > poll.max_selections) return
    submitVote(selectedOptions)
  }

  const submitVote = async (optionIds) => {
    setVoting(true)
    try {
      const updatedPoll = await voteService.cast({ pollId, optionIds })
      setPoll(updatedPoll)
      setHasVoted(true)
      setVotedOptionIds(optionIds)
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
    return <Text c="dimmed" ta="center">{t('pollNotFound')}</Text>
  }

  const pollDir = poll.language === 'he' ? 'rtl' : 'ltr'
  const isMultiple = poll.is_multiple_choice

  const isValidSelection = isMultiple 
    ? selectedOptions.length >= poll.min_selections && selectedOptions.length <= poll.max_selections
    : true

  return (
    <Card className="poll-view" shadow="sm" radius="md" withBorder p="lg" maw={560} w="100%" dir={pollDir}>
      <Stack gap="md">
        <Box>
          <Text size="xl" fw={700}>{poll.question}</Text>
        </Box>

        {hasVoted ? (
          <PollResults
            options={poll.options}
            totalVotes={poll.totalVotes}
            votedOptionIds={votedOptionIds}
            pollLanguage={poll.language}
          />
        ) : (
          <Stack gap="xs">
            {isMultiple && (
              <Text size="sm" c="dimmed">
                {t('selectionLimitError').replace('{min}', poll.min_selections).replace('{max}', poll.max_selections)}
              </Text>
            )}

            {isMultiple ? (
              <Checkbox.Group value={selectedOptions} onChange={setSelectedOptions}>
                <Stack gap="xs">
                  {poll.options.map((opt) => (
                    <Box
                      key={opt.id}
                      className="vote-option"
                      onClick={() => {
                        if (voting) return
                        const isSelected = selectedOptions.includes(opt.id)
                        if (isSelected) {
                          setSelectedOptions(selectedOptions.filter(id => id !== opt.id))
                        } else {
                          // Prevent selecting more than max
                          if (selectedOptions.length < poll.max_selections) {
                            setSelectedOptions([...selectedOptions, opt.id])
                          }
                        }
                      }}
                    >
                      <Checkbox
                        value={opt.id}
                        label={opt.text}
                        disabled={voting || (!selectedOptions.includes(opt.id) && selectedOptions.length >= poll.max_selections)}
                        className="vote-radio"
                        onChange={() => {}} // Handle click on Box instead to expand click area
                      />
                    </Box>
                  ))}
                </Stack>
              </Checkbox.Group>
            ) : (
              // Single choice (Radio)
              poll.options.map((opt) => (
                <Box
                  key={opt.id}
                  className="vote-option"
                  onClick={() => handleVoteSingle(opt.id)}
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
              ))
            )}

            {isMultiple && (
              <Button 
                onClick={handleVoteMultipleSubmit} 
                disabled={!isValidSelection || voting}
                loading={voting}
                mt="sm"
              >
                {t('submitVote')}
              </Button>
            )}
          </Stack>
        )}

        <SharePoll pollId={pollId} />
      </Stack>
    </Card>
  )
}

export default PollView
