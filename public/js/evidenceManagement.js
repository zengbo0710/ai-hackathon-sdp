document.addEventListener('DOMContentLoaded', () => {
  initializeManageEvidencesView()
  loadUsersData().then(loadUsers)
  addSaveEvidenceButton()
})

function initializeManageEvidencesView () {
  const manageEvidencesView = document.getElementById('manage-evidences-view')
  manageEvidencesView.innerHTML = `
    <div class="content-area">
      ${generateAddNewRecordSection()}
      ${generateSelectUsersSection()}
      ${generateKeyAchievementsSection()}
      ${generateMatchBehavioursSection()}
    </div>
  `

  document.getElementById('generate-evidence-summary').addEventListener('click', generateEvidenceSummary)
  document.getElementById('match-behaviours').addEventListener('click', matchBehaviours)
}

function generateAddNewRecordSection () {
  return `
    <section class="card animate__animated animate__fadeIn">
      <h2>Add New Record</h2>
      <div class="evidence-form">
        <div class="form-group">
          <label for="evidence-text">Development Details:</label>
          <textarea id="evidence-text" rows="4" placeholder="Enter the full text of the record"></textarea>
        </div>
        <div class="form-group">
          <label for="evidence-link">Development Record:</label>
          <input type="url" id="evidence-link" placeholder="Enter the link to the record">
        </div>
        <button id="generate-evidence-summary" class="btn btn-primary">Generate Record Summary</button>
        <div class="form-group">
          <textarea id="evidence-summary" rows="6" placeholder="Generated summary will appear here"></textarea>
        </div>
      </div>
    </section>
  `
}

function generateSelectUsersSection () {
  return `
    <section class="card animate__animated animate__fadeIn">
      <h2>Select Users</h2>
      <div id="user-checkboxes" class="user-list"></div>
    </section>
  `
}

function generateKeyAchievementsSection () {
  return `
    <section class="card animate__animated animate__fadeIn">
      <h2>Key Achievements</h2>
      <div class="form-group">
        <label>
          <input type="checkbox" id="add-to-impact" name="add-to-impact">
          Add to Key Achievements
        </label>
      </div>
    </section>
  `
}

function generateMatchBehavioursSection () {
  return `
    <section class="card animate__animated animate__fadeIn">
      <h2>Match Behaviours</h2>
      <button id="match-behaviours" class="btn btn-secondary">Match Behaviours</button>
      <div id="behaviour-matches" class="behaviour-matches"></div>
    </section>
  `
}

async function loadUsersData () {
  try {
    const response = await fetch('/api/users')
    if (!response.ok) throw new Error('Failed to fetch users')
    globalUsers = await response.json()
  } catch (error) {
    console.error('Error loading users:', error)
    showNotification('Failed to load users. Please try refreshing the page.', 'error')
  }
}

function generateEvidenceSummary () {
  const evidenceText = document.getElementById('evidence-text').value.trim()
  const summaryTextarea = document.getElementById('evidence-summary')

  if (!evidenceText) {
    showNotification('Please enter some text in the Evidence Full Text field.', 'error')
    return
  }

  summaryTextarea.value = 'Generating evidence summary...'

  fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: evidenceText })
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) throw new Error(data.error)
      summaryTextarea.value = data.summary
    })
    .catch(error => {
      console.error('Error generating summary:', error)
      summaryTextarea.value = 'Failed to generate summary. Please try again.'
    })
}

function matchBehaviours () {
  const summary = document.getElementById('evidence-summary').value.trim()
  const behaviourMatchesDiv = document.getElementById('behaviour-matches')
  const selectedUsers = Array.from(document.querySelectorAll('#user-checkboxes input[type="checkbox"]:checked'))

  if (selectedUsers.length === 0) {
    behaviourMatchesDiv.innerHTML = '<p>Please select at least one user before matching behaviours.</p>'
    return
  }

  if (!summary) {
    behaviourMatchesDiv.innerHTML = '<p>Please generate a summary before matching behaviours.</p>'
    return
  }

  behaviourMatchesDiv.innerHTML = '<p>Matching behaviours...</p>'

  const userRequests = selectedUsers.map(userCheckbox => {
    return fetch('/api/top-picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: summary, user_id: userCheckbox.value })
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return response.json()
      })
  })

  Promise.all(userRequests)
    .then(results => {
      behaviourMatchesDiv.innerHTML = generateBehaviourMatchesHTML(results, selectedUsers)
      document.querySelectorAll('.show-full-list').forEach(button => {
        button.addEventListener('click', toggleFullBehaviourList)
      })
    })
    .catch(error => {
      console.error('Error matching behaviours:', error)
      behaviourMatchesDiv.innerHTML = `<p>Failed to match behaviours. Error: ${error.message}</p>`
    })
}

function generateBehaviourMatchesHTML (results, selectedUsers) {
  return `
    <h3>Top 3 Matching Behaviours for Selected Users:</h3>
    ${results.map((data, index) => {
    const user = selectedUsers[index]
    const userLabel = user.nextElementSibling.textContent
    const matches = data.behaviours.slice(0, 3).map(match => {
      return {
        behaviour: match.behaviour.split('|')[0].trim(),
        behaviourId: match.behaviour.split('|')[1].trim(),
        subBehaviour: match.subBehaviour.replace(/[\[\]]/g, '').split('|')[0].trim(),
        subBehaviourId: match.subBehaviour.replace(/[\[\]]/g, '').split('|')[1].trim()
      }
    })

    return `
        <div class="user-behaviour-matches">
          <h4>${userLabel}</h4>
          <div class="behaviour-list">
            ${matches.map(match => `
              <div class="behaviour-item">
                <label>
                  <input type="checkbox" name="behaviour-${user.value}" value="${match.behaviourId}|${match.subBehaviourId}">
                  <strong>${match.behaviour}:</strong> ${match.subBehaviour}
                </label>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-secondary show-full-list" data-user-id="${user.value}">Show All Behaviours</button>
          <div id="full-behaviour-list-${user.value}" class="full-behaviour-list" style="display: none;"></div>
        </div>
      `
  }).join('')}
  `
}

function toggleFullBehaviourList (event) {
  const userId = event.target.dataset.userId
  const fullBehaviourList = document.getElementById(`full-behaviour-list-${userId}`)

  if (fullBehaviourList.style.display === 'none') {
    fullBehaviourList.style.display = 'block'
    event.target.textContent = 'Hide All Behaviours'

    if (fullBehaviourList.innerHTML === '') {
      loadFullBehaviourList(userId, fullBehaviourList)
    }
  } else {
    fullBehaviourList.style.display = 'none'
    event.target.textContent = 'Show All Behaviours'
  }
}

function loadFullBehaviourList (userId, fullBehaviourList) {
  const user = globalUsers.find(u => u.user.user_id.toString() === userId)

  if (user) {
    fullBehaviourList.innerHTML = renderBehaviourList(user.schema.behaviour, userId)
  } else {
    fullBehaviourList.innerHTML = '<p>User data not found. Please try again.</p>'
  }
}

function renderBehaviourList (behaviours, userId) {
  return behaviours.map(behaviour => `
    <div class="behaviour-category">
      <h5>${behaviour.name}</h5>
      ${behaviour.sub_behaviour.map(subBehaviour => `
        <div class="behaviour-item">
          <label>
            <input type="checkbox" name="behaviour-${userId}" value="${behaviour.behaviour_id}|${subBehaviour.sub_behaviour_id}">
            ${subBehaviour.description}
          </label>
        </div>
      `).join('')}
    </div>
  `).join('')
}

function saveEvidence () {
  const fullText = document.getElementById('evidence-text').value.trim()
  const link = document.getElementById('evidence-link').value.trim()
  const summary = document.getElementById('evidence-summary').value.trim()
  const selectedUsers = Array.from(document.querySelectorAll('#user-checkboxes input[type="checkbox"]:checked'))
  const addToImpact = document.getElementById('add-to-impact').checked

  if (!fullText || !link) {
    showNotification('Please fill in both the Evidence Full Text and Evidence Link fields.', 'error')
    return
  }

  const userBehaviours = selectedUsers.map(user => {
    const userId = user.value
    const selectedBehaviours = Array.from(document.querySelectorAll(`input[name="behaviour-${userId}"]:checked`))
      .map(checkbox => {
        const [behaviourIdRaw, subBehaviourIdRaw] = checkbox.value.split('|')
        const behaviourId = parseFloat(behaviourIdRaw.replace(/[^\d.]/g, ''))
        const subBehaviourId = parseFloat(subBehaviourIdRaw.replace(/[^\d.]/g, ''))

        const behaviourItem = checkbox.closest('.behaviour-item')
        let behaviour, subBehaviour
        const strongElement = behaviourItem.querySelector('strong')
        if (strongElement) {
          behaviour = strongElement.textContent.trim()
          const splitText = behaviourItem.textContent.split(':')[1]
          subBehaviour = splitText ? splitText.trim() : behaviourItem.textContent.trim()
        } else {
          const categoryHeading = behaviourItem.closest('.behaviour-category').querySelector('h5')
          behaviour = categoryHeading ? categoryHeading.textContent.trim() : ''
          subBehaviour = behaviourItem.textContent.trim()
        }

        return { behaviour, subBehaviour, behaviourId, subBehaviourId }
      })

    return {
      userId,
      name: user.dataset.name,
      role: user.dataset.role,
      level: user.dataset.level,
      roleId: user.dataset.roleId,
      levelId: user.dataset.levelId,
      selectedBehaviours
    }
  })

  const evidenceData = {
    fullText,
    link,
    summary,
    userBehaviours,
    addToImpact
  }

  fetch('/api/save-evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evidenceData)
  })
    .then(response => {
      if (response.status === 400) {
        return response.json().then(data => {
          throw new Error(data.message || 'Please fill in all required fields correctly.')
        })
      }
      if (!response.ok) throw new Error('Failed to save evidence')
      return response.json()
    })
    .then(data => {
      console.log('Evidence saved successfully:', data)
      showNotification('Evidence saved successfully!', 'success')
      clearForm()
      return fetchUsers()
    })
    .then(() => {
      loadUsersData().then(loadUsers)
      hideUserDetails()
    })
    .catch(error => {
      console.error('Error saving evidence:', error)
      showNotification(error.message || 'Failed to save evidence. Please try again.', 'error')
    })
}

function clearForm () {
  document.getElementById('evidence-text').value = ''
  document.getElementById('evidence-link').value = ''
  document.getElementById('evidence-summary').value = ''
  document.querySelectorAll('#user-checkboxes input[type="checkbox"]').forEach(checkbox => checkbox.checked = false)
  document.getElementById('behaviour-matches').innerHTML = ''
  document.getElementById('add-to-impact').checked = false
}

function loadUsers () {
  const userCheckboxes = document.getElementById('user-checkboxes')
  userCheckboxes.innerHTML = globalUsers.map(userData => {
    const user = userData.user
    return `
      <div class="user-item">
        <label>
          <input type="checkbox" name="user-${user.user_id}" value="${user.user_id}"
            data-name="${user.name}" data-role="${user.role}" data-level="${user.level}"
            data-role-id="${user.role_id}" data-level-id="${user.level_id}">
          <span>${user.name} (${user.role} - ${user.level})</span>
        </label>
      </div>
    `
  }).join('')
}

function showNotification (message, type = 'info') {
  const notificationContainer = document.getElementById('notification-container') || createNotificationContainer()
  const notification = document.createElement('div')
  notification.className = `notification ${type}`
  notification.innerHTML = `
    <span class="notification-message">${message}</span>
    <button class="notification-close">&times;</button>
  `

  notificationContainer.appendChild(notification)
  notification.querySelector('.notification-close').addEventListener('click', () => notification.remove())
  setTimeout(() => notification.remove(), 5000)
}

function createNotificationContainer () {
  const container = document.createElement('div')
  container.id = 'notification-container'
  document.body.appendChild(container)
  return container
}

function addSaveEvidenceButton () {
  const contentArea = document.querySelector('.content-area')
  const saveButtonSection = document.createElement('section')
  saveButtonSection.className = 'card animate__animated animate__fadeIn save-evidence-section'
  saveButtonSection.innerHTML = '<button id="save-evidence" class="btn btn-primary btn-large">Save Record</button>'
  contentArea.appendChild(saveButtonSection)
  document.getElementById('save-evidence').addEventListener('click', saveEvidence)
}
