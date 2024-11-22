let lastGradingResponse = null

function hideGradingSection () {
  document.getElementById('essay-grading-section').style.display = 'none'
}

function showGradingSection () {
  document.getElementById('essay-grading-section').style.display = 'block'
}

function generateEssayGradingSection (currentEssay = '') {
  const essayGradingSection = document.getElementById('essay-grading-section')
  essayGradingSection.innerHTML = `
      <h2>English Essay Grading</h2>
      <div class="form-group">
        <textarea id="student-essay" rows="10" placeholder="Enter your essay here"></textarea>
      </div>
      <button id="submit-for-grading" class="btn btn-primary">Submit for Grading</button>
      
      <div class="grading-results" style="display: none;">
        <h3>Grading Details</h3>
        <p id="grading-details"></p>
        <div class="button-group" style="display: flex; gap: 10px;">
          <button id="generate-improved-essay" class="btn btn-primary" style="display: none;">Generate Improved Version</button>
          <button id="generate-essay-summary" class="btn btn-primary" style="display: none;">Generate Essay Summary</button>
        </div>
        <div id="improved-essay-section" style="display: none;">
          <h3>Improved Essay</h3>
          <p id="improved-essay"></p>
        </div>
        <div id="essay-summary-section" style="display: none;">
          <h3>Essay Summary</h3>
          <p id="essay-summary"></p>
        </div>
      </div>
  `
  addFadeInAnimation(essayGradingSection)

  // Add event listeners
  document.getElementById('submit-for-grading').addEventListener('click', submitForGrading)
  document.getElementById('generate-improved-essay').addEventListener('click', generateImprovedEssay)
  document.getElementById('generate-essay-summary').addEventListener('click', generateEssaySummary)
}

function submitForGrading () {
  const essayTextarea = document.getElementById('student-essay')
  const gradingDetails = document.getElementById('grading-details')
  const gradingResults = document.querySelector('.grading-results')

  if (!essayTextarea) {
    showNotification('Essay textarea not found.', 'error')
    return
  }

  const essay = essayTextarea.value.trim()
  if (!essay) {
    showNotification('Please enter an essay to grade.', 'error')
    return
  }

  const userSelect = document.getElementById('user-select')
  const selectedUserId = userSelect.value

  if (!selectedUserId) {
    showNotification('Please select a student first.', 'error')
    return
  }

  const selectedUser = globalUsers.find(user => user.user.user_id.toString() === selectedUserId)
  if (!selectedUser) {
    showNotification('Selected user details not found.', 'error')
    return
  }

  gradingDetails.textContent = 'Grading essay...'
  gradingResults.style.display = 'block'

  fetch('/api/grade-essay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      essay,
      user: selectedUser
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) throw new Error(data.error)
      // Store the grading response
      lastGradingResponse = data

      // Convert the pipe-separated data into an HTML table
      const rows = data.split('\n')
      let tableHTML = '<table class="grading-table"><thead><tr><th>Criteria</th><th>Score</th><th>Comments</th></tr></thead><tbody>'

      rows.forEach(row => {
        const [criteria, score, ...comments] = row.split('|')
        if (criteria && score) {
          tableHTML += `<tr>
            <td>${criteria}</td>
            <td>${score}</td>
            <td>${comments.join('|')}</td>
          </tr>`
        }
      })

      tableHTML += '</tbody></table>'
      gradingDetails.innerHTML = tableHTML
      document.getElementById('generate-improved-essay').style.display = 'block'
      document.getElementById('generate-essay-summary').style.display = 'block'
    })
    .catch(error => {
      lastGradingResponse = null
      console.error('Error grading essay:', error)
      gradingDetails.textContent = 'Failed to grade essay. Please try again.'
      showNotification('Failed to grade essay. Please try again.', 'error')
    })
}

function generateImprovedEssay () {
  const essayTextarea = document.getElementById('student-essay')
  const improvedEssayElement = document.getElementById('improved-essay')
  const improvedEssaySection = document.getElementById('improved-essay-section')

  if (!essayTextarea || !improvedEssayElement) {
    showNotification('Required elements not found.', 'error')
    return
  }

  const essay = essayTextarea.value.trim()
  if (!essay) {
    showNotification('No essay to improve.', 'error')
    return
  }

  // Show the section first so the loading message is visible
  improvedEssaySection.style.display = 'block'
  improvedEssayElement.textContent = 'Generating improved version...'

  const userSelect = document.getElementById('user-select')
  const selectedUserId = userSelect.value

  if (!selectedUserId) {
    showNotification('Please select a student first.', 'error')
    return
  }

  const selectedUser = globalUsers.find(user => user.user.user_id.toString() === selectedUserId)
  if (!selectedUser) {
    showNotification('Selected user details not found.', 'error')
    return
  }

  fetch('/api/improve-essay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ essay, user: selectedUser })
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) throw new Error(data.error)
      document.getElementById('improved-essay-section').style.display = 'block'
      console.log(data)
      // Format the response into sections
      const formattedResponse = data.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split('|')
          const titlePart = parts[0] || ''
          const content = parts[1] || '' // Default to empty string if content is undefined
          const title = titlePart.replace('[', '').replace(']', '').trim()
          return `<div class="essay-section">
            <p>${title}</p>
            <p>${content.trim()}</p>
          </div>`
        })
        .join('')

      improvedEssayElement.innerHTML = formattedResponse
    })
    .catch(error => {
      console.error('Error generating improved essay:', error)
      improvedEssayElement.textContent = 'Failed to generate improved version. Please try again.'
      showNotification('Failed to generate improved essay. Please try again.', 'error')
    })
}

function generateEssaySummary () {
  const essayTextarea = document.getElementById('student-essay')
  const essaySummaryElement = document.getElementById('essay-summary')
  const essaySummarySection = document.getElementById('essay-summary-section')

  if (!essayTextarea || !essaySummaryElement) {
    showNotification('Required elements not found.', 'error')
    return
  }

  const essay = essayTextarea.value.trim()
  if (!essay) {
    showNotification('No essay to summarize.', 'error')
    return
  }

  essaySummarySection.style.display = 'block'
  essaySummaryElement.textContent = 'Generating summary...'

  const userSelect = document.getElementById('user-select')
  const selectedUserId = userSelect.value

  if (!selectedUserId) {
    showNotification('Please select a student first.', 'error')
    return
  }

  const selectedUser = globalUsers.find(user => user.user.user_id.toString() === selectedUserId)
  if (!selectedUser) {
    showNotification('Selected user details not found.', 'error')
    return
  }

  fetch('/api/summarize-essay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      essay,
      user: selectedUser,
      gradingResponse: lastGradingResponse // Include the grading response
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) throw new Error(data.error)
      essaySummaryElement.innerHTML = data
    })
    .catch(error => {
      console.error('Error generating essay summary:', error)
      essaySummaryElement.textContent = 'Failed to generate summary. Please try again.'
      showNotification('Failed to generate essay summary. Please try again.', 'error')
    })
}
