require('../load_config')
const express = require('express')
const path = require('path')
const app = express()
const port = 3000

app.use(express.static(path.join(__dirname, '..', 'public')))

const generateSummary = require('./generateSummary')
const generateSummaryAndBehaviours = require('./generateTopPicks')
const getUsers = require('./getUsers')
const updateUser = require('./updateUser')
const saveEvidence = require('./saveEvidence')
const generateUserSummary = require('./generateUserSummary')
const saveUserSummary = require('./saveUserSummary')
const gradeEnglishEssay = require('./gradeEnglishEssay')
const improveEnglishEssay = require('./improveEnglishEssay')
const summarizeEssay = require('./summarizeEssay')
const analyzeDrawing = require('./analyzeDrawing')
const db = require('../util/db')
const _ = require('lodash')

app.use(express.json({ limit: '10mb' }))

app.post('/api/analyze-drawing', async (req, res) => {
  try {
    const { drawingData, user } = req.body
    const drawingAnalysis = await analyzeDrawing(drawingData, user)
    res.json({ drawingAnalysis })
  } catch (error) {
    console.error('Error getting users:', error)
    res.status(500).json({ error: 'Failed to get users' })
  }
})

app.post('/api/update-user', async (req, res) => {
  try {
    const users = await updateUser(req.body)
    res.json(users)
  } catch (error) {
    console.error('Error getting users:', error)
    res.status(500).json({ error: 'Failed to get users' })
  }
})

app.post('/api/grade-essay', async (req, res) => {
  try {
    const { essay, user } = req.body
    const result = await gradeEnglishEssay(essay, user)
    res.json(result)
  } catch (error) {
    console.error('Error getting users:', error)
    res.status(500).json({ error: 'Failed to get users' })
  }
})

app.post('/api/improve-essay', async (req, res) => {
  try {
    const { essay, user } = req.body
    const result = await improveEnglishEssay(essay, user)
    res.json(result)
  } catch (error) {
    console.error('Error getting users:', error)
    res.status(500).json({ error: 'Failed to get users' })
  }
})

app.post('/api/summarize-essay', async (req, res) => {
  try {
    const { essay, user, gradingResponse } = req.body
    const result = await summarizeEssay(essay, user, gradingResponse)
    res.json(result)
  } catch (error) {
    console.error('Error getting users:', error)
    res.status(500).json({ error: 'Failed to get users' })
  }
})

app.get('/api/users', async (req, res) => {
  try {
    const users = await getUsers()
    res.json(users)
  } catch (error) {
    console.error('Error getting users:', error)
    res.status(500).json({ error: 'Failed to get users' })
  }
})

app.post('/api/generate-user-summary', async (req, res) => {
  const { userId } = req.body

  try {
    const summary = await generateUserSummary(userId)
    res.json({ summary })
  } catch (error) {
    console.error('Error generating summary:', error)
    res.status(500).json({ error: 'Failed to generate summary' })
  }
})

app.post('/api/summarize', async (req, res) => {
  const { text } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  try {
    const summary = await generateSummary(text)
    res.json({ summary })
  } catch (error) {
    console.error('Error generating summary:', error)
    res.status(500).json({ error: 'Failed to generate summary' })
  }
})

app.post('/api/top-picks', async (req, res) => {
  const { text, user_id } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  try {
    const result = await generateSummaryAndBehaviours(text, user_id)
    res.json(result)
  } catch (error) {
    console.error('Error generating summary and behaviours:', error)
    res.status(500).json({ error: 'Failed to generate summary and behaviours' })
  }
})

app.post('/api/save-evidence', async (req, res) => {
  const { fullText, link, summary, userBehaviours, addToImpact } = req.body

  if (!fullText || !link || !summary) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const result = await saveEvidence(fullText, link, summary, userBehaviours, addToImpact)
    if (result.success) {
      res.json({ message: result.message, evidenceId: result.evidenceId })
    } else {
      res.status(500).json({ error: result.message })
    }
  } catch (error) {
    console.error('Error saving evidence:', error)
    res.status(500).json({ error: 'Failed to save evidence' })
  }
})

app.post('/api/save-user-summary', async (req, res) => {
  const { userId, summary } = req.body

  if (!userId || !summary) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const result = await saveUserSummary(userId, summary)
    if (result.success) {
      res.json({ message: result.message, evidenceId: result.evidenceId })
    } else {
      res.status(500).json({ error: result.message })
    }
  } catch (error) {
    console.error('Error saving evidence:', error)
    res.status(500).json({ error: 'Failed to save evidence' })
  }
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`)

  const records = await db.retrieveAll('config')
  _.forEach(records, record => { global[record.key] = Number(record.value) })

  await getUsers()
})
