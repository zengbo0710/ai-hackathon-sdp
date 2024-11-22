function hideSummaryDetails () {
  document.getElementById('user-summary-info').style.display = 'none'
}

function showSummaryDetails () {
  document.getElementById('user-summary-info').style.display = 'block'
}

function generateUserSummaryInfo (summary) {
  const userSummarySection = document.getElementById('user-summary-info')
  userSummarySection.innerHTML = `
      <h2>Generate User Summary</h2>
      <button id="generate-user-summary" class="btn btn-primary">Generate User Summary</button>
      <div class="form-group">
        <p id="user-summary" class="summary-text">Generated summary will appear here</p>
      </div>
      <button id="save-user-summary" class="btn btn-primary" style="display: none;">Save Summary</button>
  `
  addFadeInAnimation(userSummarySection)

  // Add event listener for the generate button
  document.getElementById('generate-user-summary').addEventListener('click', generateSummary)

  // Add event listener for the save button
  document.getElementById('save-user-summary').addEventListener('click', saveSummary)
}

function generateSummary () {
  // Get the current selected user ID
  const selectedUserIdElement = document.getElementById('user-select')

  if (!selectedUserIdElement) {
    showNotification('User selection element not found.', 'error')
    return
  }

  const selectedUserId = selectedUserIdElement.value

  if (!selectedUserId) {
    showNotification('No user selected.', 'error')
    return
  }

  // Show loading indicator
  const summaryElement = document.getElementById('user-summary')
  if (!summaryElement) {
    showNotification('Summary element not found.', 'error')
    return
  }

  summaryElement.textContent = 'Generating user summary...'

  fetch('/api/generate-user-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId: selectedUserId })
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error)
      }
      summaryElement.innerHTML = data.summary
      // Show save button after successful summary generation
      document.getElementById('save-user-summary').style.display = 'block'
    })
    .catch(error => {
      console.error('Error generating user summary:', error)
      summaryElement.textContent = 'Failed to generate summary. Please try again.'
      // Hide save button if generation fails
      document.getElementById('save-user-summary').style.display = 'none'
      showNotification('Failed to generate user summary. Please try again.', 'error')
    })
}

function saveSummary () {
  const summaryElement = document.getElementById('user-summary')
  const selectedUserIdElement = document.getElementById('user-select')

  if (!summaryElement || !selectedUserIdElement) {
    showNotification('Required elements not found.', 'error')
    return
  }

  const summary = summaryElement.innerHTML
  const userId = selectedUserIdElement.value

  if (!summary.trim()) {
    showNotification('No summary to save.', 'error')
    return
  }

  if (!userId) {
    showNotification('No user selected.', 'error')
    return
  }

  fetch('/api/save-user-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, summary })
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error)
      }
      showNotification('User Summary saved successfully!', 'success')
      summaryElement.textContent = '' // Clear the summary after successful save
    })
    .catch(error => {
      console.error('Error saving summary:', error)
      showNotification('Failed to save summary. Please try again.', 'error')
    })
}
