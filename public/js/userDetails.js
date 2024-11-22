function hideUserDetails () {
  document.getElementById('user-info').style.display = 'none'
  document.getElementById('progress').style.display = 'none'
  document.getElementById('summary').style.display = 'none'
  document.getElementById('impact').style.display = 'none'
  document.getElementById('behaviours-list').style.display = 'none'
  document.getElementById('user-radar').style.display = 'none'
}

function showUserDetails () {
  document.getElementById('user-info').style.display = 'block'
  document.getElementById('progress').style.display = 'block'
  document.getElementById('summary').style.display = 'block'
  document.getElementById('impact').style.display = 'block'
  document.getElementById('behaviours-list').style.display = 'block'
  document.getElementById('user-radar').style.display = 'block'
}

function showWelcomeMessage (viewId, header) {
  removeWelcomeMessages()
  const showDetailsView = document.getElementById(viewId)
  const contentArea = showDetailsView.querySelector('.content-area')
  const welcomeMessage = document.createElement('div')
  welcomeMessage.id = 'welcome-message'
  welcomeMessage.className = 'card animate__animated animate__fadeIn'
  welcomeMessage.innerHTML = `
      <h2>Welcome to ${header} Dashboard</h2>
      <p>Please select a student from the dropdown menu above to kick start.</p>
    `
  contentArea.insertBefore(welcomeMessage, contentArea.firstChild)
}

function hideWelcomeMessage () {
  const welcomeMessage = document.getElementById('welcome-message')
  if (welcomeMessage) {
    welcomeMessage.remove()
  }
}

function displayRadarChart (user) {
  const userRadarSection = document.getElementById('user-radar')
  userRadarSection.innerHTML = `
  <h2>Learning Journey Compass</h2>
  <div class="user-radar-chart-container">
        <canvas id="radarChart" style="max-height: 500px;"></canvas>
      </div>
      `
  createRadarChart(user.name)
}

function displayUserInfo (user) {
  const userInfoSection = document.getElementById('user-info')
  userInfoSection.innerHTML = `
    <div class="user-details-container">
      <div class="user-details">
        <h2>${user.name}</h2>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Target Level:</strong> ${user.level}</p>
      </div>
      <div class="velocity-chart-container">
        <canvas id="velocityChart"></canvas>
      </div>
  `
  addFadeInAnimation(userInfoSection)
  createVelocityChart(user.user_id)

  // Add Modify button only for users with appropriate permissions
  const hasModifyPermission = false
  if (hasModifyPermission) {
    const modifyButton = document.createElement('button')
    modifyButton.id = 'modify-user-details'
    modifyButton.className = 'btn btn-secondary'
    modifyButton.textContent = 'Modify'
    modifyButton.onclick = enableModifyMode
    userInfoSection.appendChild(modifyButton)
  }
}

function enableModifyMode () {
  const userInfoSection = document.getElementById('user-info')
  const summarySection = document.getElementById('summary')
  const impactSection = document.getElementById('impact')
  const behavioursSection = document.getElementById('behaviours-list')

  // Add remove buttons to summary
  addRemoveButton(summarySection, 'summary')

  // Add remove buttons to impact items
  const impactItems = impactSection.querySelectorAll('.evidence-item')
  impactItems.forEach(item => addRemoveButton(item, 'impact'))

  // Add remove buttons to evidence items in behaviours
  const evidenceItems = behavioursSection.querySelectorAll('.evidence-item')
  evidenceItems.forEach(item => addRemoveButton(item, 'evidence'))

  // Change Modify button to Save Changes
  const modifyButton = document.getElementById('modify-user-details')
  modifyButton.textContent = 'Save Changes'
  modifyButton.onclick = saveChanges
}

function addRemoveButton (element, type) {
  const removeButton = document.createElement('button')
  removeButton.className = 'remove-button'
  removeButton.innerHTML = '&times;'
  removeButton.onclick = () => removeItem(element, type)
  element.style.position = 'relative'
  element.insertBefore(removeButton, element.firstChild)
}

function removeItem (element, type) {
  if (type === 'summary') {
    element.querySelector('p').textContent = ''
  } else {
    element.remove()
  }
}

function saveChanges () {
  const userId = document.getElementById('user-select').value
  const wantedUser = globalUsers.find(u => u.user.user_id.toString() === userId)

  if (!wantedUser) {
    showNotification('User not found', 'error')
    return
  }

  // Update summary
  const summaryText = document.getElementById('summary-text').textContent
  wantedUser.schema.summary = summaryText

  // Update impact
  const impactItems = document.querySelectorAll('#impact-list .evidence-item')
  wantedUser.schema.impact = Array.from(impactItems).map(item => ({
    description: item.querySelector('.evidence-summary').textContent,
    link: item.querySelector('.evidence-link').href,
    id: Number(item.querySelector('.evidence-content').id.replace('evidence-id-', ''))
  }))

  // Update behaviours
  const leftOverBehaviours = []
  const behaviourSections = document.querySelectorAll('.behaviour-section')
  behaviourSections.forEach(section => {
    const behaviourName = section.querySelector('.behaviour-title').textContent
    const behaviour = wantedUser.schema.behaviour.find(b => b.name === behaviourName)
    if (behaviour) {
      const subBehaviours = section.querySelectorAll('.sub-behaviour')
      subBehaviours.forEach(subSection => {
        const subBehaviourDesc = subSection.querySelector('.sub-behaviour-description').textContent
        const subBehaviour = behaviour.sub_behaviour.find(sb => sb.description === subBehaviourDesc)
        if (subBehaviour) {
          const evidenceItems = subSection.querySelectorAll('.evidence-item')
          subBehaviour.evidences = Array.from(evidenceItems).map(item => ({
            summary: item.querySelector('.evidence-summary').textContent,
            link: item.querySelector('.evidence-link').href,
            id: Number(item.querySelector('.evidence-content').id.replace('evidence-id-', ''))
          }))
          leftOverBehaviours.push(subBehaviour)
        }
      })
    }
  })
  wantedUser.schema.behaviour = leftOverBehaviours

  // Save updated user data
  fetch('/api/update-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(wantedUser)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save user data')
      }
      return response.json()
    })
    .then(data => {
      showNotification('User data saved successfully', 'success')
      const showDetailsLink = document.getElementById('show-details-link')
      showDetailsLink.click()
      // // Trigger the showDetailsLink click
      // const showDetailsLink = document.querySelector('.nav-link[href="#show-details"]')
      // if (showDetailsLink) {
      // showDetailsLink.click()
      // } else {
      //   console.error('Show Details link not found')
      // }
    })
    .catch(error => {
      console.error('Error saving user data:', error)
      showNotification('Failed to save user data. Please try again.', 'error')
    })
}

function displaySummary (summary) {
  const summarySection = document.getElementById('summary-text')
  summarySection.innerHTML = summary
  addFadeInAnimation(summarySection)
}

function displayImpact (impacts) {
  const impactList = document.getElementById('impact-list')
  impactList.innerHTML = impacts.map(impact => `
    <li class="evidence-item">
      <div class="evidence-content" id="evidence-id-${impact.id}">
        <p class="evidence-summary">${impact.description}</p>
        <div class="evidence-link-container">
          <a href="https://www.msf.gov.sg/what-we-do/student-care/home" class="evidence-link" target="_blank">Evidence Link</a>
        </div>
      </div>
    </li>
  `).join('')
  addFadeInAnimation(impactList)
}

function displayBehaviours (behaviours) {
  const behavioursSection = document.getElementById('behaviours-list')
  behavioursSection.innerHTML = behaviours
    .filter(behaviour => behaviour.sub_behaviour.some(subBehaviour => subBehaviour.evidences.length > 0))
    .map(behaviour => `
    <section class="behaviour-section card animate__animated animate__fadeIn">
      <div class="behaviour-header">
        <h2 class="behaviour-title">${behaviour.name}</h2>
        <p class="behaviour-description">${behaviour.description}</p>
      </div>
      ${behaviour.sub_behaviour
        .filter(subBehaviour => subBehaviour.evidences.length > 0)
        .map(subBehaviour => `
          <div class="sub-behaviour">
            <p class="sub-behaviour-description">${subBehaviour.description}</p>
            <div class="evidence-table">
              ${createEvidenceTable(subBehaviour.evidences)}
            </div>
          </div>
        `).join('')}
    </section>
  `).join('')
  addFadeInAnimation(behavioursSection)

  displayProgress(behaviours)
}

function createEvidenceTable (evidences) {
  let tableHTML = '<table class="evidence-table"><tbody>'
  for (let i = 0; i < evidences.length; i += 2) {
    tableHTML += '<tr>'
    tableHTML += createEvidenceCell(evidences[i])
    if (i + 1 < evidences.length) {
      tableHTML += createEvidenceCell(evidences[i + 1])
    } else {
      tableHTML += '<td></td>'
    }
    tableHTML += '</tr>'
  }
  tableHTML += '</tbody></table>'
  return tableHTML
}

function createEvidenceCell (evidence) {
  return `
      <td>
        <div class="evidence-item">
          <div class="evidence-content" id="evidence-id-${evidence.id}">
            <p class="evidence-summary">${evidence.summary}</p>
            <div class="evidence-link-container">
              <a href="https://www.msf.gov.sg/what-we-do/student-care/home" class="evidence-link" target="_blank">View Evidence</a>
            </div>
          </div>
        </div>
      </td>
    `
}

function chunkArray (array, size) {
  return array.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(array.slice(i, i + size))
    return acc
  }, [])
}

function displayProgress (behaviours) {
  const progressTable = document.getElementById('progress-table')
  // Clear existing content
  progressTable.innerHTML = ''

  const table = document.createElement('table')
  table.className = 'progress-table'

  // Create header row
  const headerRow = document.createElement('tr')
  behaviours.forEach(behaviour => {
    const th = document.createElement('th')
    th.textContent = behaviour.name
    th.className = getBehaviourClass(behaviour)
    headerRow.appendChild(th)
  })
  table.appendChild(headerRow)

  // Create sub-behaviour rows
  const maxSubBehaviours = Math.max(...behaviours.map(b => b.sub_behaviour.length))
  for (let i = 0; i < maxSubBehaviours; i++) {
    const row = document.createElement('tr')
    behaviours.forEach(behaviour => {
      const td = document.createElement('td')
      if (behaviour.sub_behaviour[i]) {
        td.innerHTML = behaviour.sub_behaviour[i].description
        td.className = getSubBehaviourClass(behaviour.sub_behaviour[i])
      }
      row.appendChild(td)
    })
    table.appendChild(row)
  }

  progressTable.appendChild(table)
}

function getBehaviourClass (behaviour) {
  const progressSubBehaviours = behaviour.sub_behaviour.filter(sb => sb.evidences.length > 0).length
  if (progressSubBehaviours > 1) return 'completed'
  if (progressSubBehaviours === 1) return 'in-progress'
  return 'not-started'
}

function getSubBehaviourClass (subBehaviour) {
  if (subBehaviour.evidences.length > 1) return 'completed'
  if (subBehaviour.evidences.length === 1) return 'in-progress'
  return ''
}

function removeWelcomeMessages () {
  const welcomeMessages = document.querySelectorAll('#welcome-message')
  welcomeMessages.forEach(message => message.remove())
}

function createVelocityChart (userId) {
  const selectedUser = globalUsers.find(user => user.user.user_id === userId)

  if (!selectedUser || !selectedUser.additional_info || !selectedUser.additional_info.progress_velocity) {
    console.error('Velocity data not found for user:', userId)
    return
  }

  const velocityData = selectedUser.additional_info.progress_velocity
  const ctx = document.getElementById('velocityChart').getContext('2d')

  // Create an array of 12 weeks
  const labels = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`)
  const paddedData = labels.map((label, index) => {
    const value = velocityData[index]
    return [label, value !== undefined ? value : null]
  })

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Progress Velocity',
        data: paddedData,
        borderColor: 'rgba(66, 133, 244, 0.5)',
        backgroundColor: 'rgba(66, 133, 244, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: {
            callback: function (value) {
              return (value * 100) + '%'
            },
            stepSize: 0.2
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            callback: function (value, index) {
              // Show label every 2 weeks
              return index % 2 === 0 ? `Week ${value + 1}` : ''
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'var(--card-background)',
          titleColor: 'var(--text-color)',
          bodyColor: 'var(--text-color)',
          borderColor: 'var(--primary-color)',
          borderWidth: 1,
          callbacks: {
            label: function (context) {
              return `Progress: ${(context.parsed.y * 100).toFixed(1)}%`
            }
          }
        }
      }
    }
  })
}

function createRadarChart (name) {
  const ctx = document.getElementById('radarChart').getContext('2d')

  const data = {
    labels: [
      'Academics',
      'Social Skills',
      'Holistic Creative Development',
      'Character Development',
      'Physical Wellness'
    ],
    datasets: [
      {
        label: name,
        data: [0.65, 0.25, 0.3, 0.28, 0.32],
        borderColor: 'rgba(66, 133, 244, 1)',
        backgroundColor: 'rgba(66, 133, 244, 0.2)',
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(66, 133, 244, 1)'
      },
      {
        label: 'Regional Average',
        data: [0.9, 0.72, 0.55, 0.4, 0.6],
        borderColor: 'rgba(219, 68, 55, 0.5)',
        backgroundColor: 'rgba(219, 68, 55, 0.1)',
        borderWidth: 1.5,
        pointRadius: 2,
        pointBackgroundColor: 'rgba(219, 68, 55, 0.5)'
      },
      {
        label: 'Global Average',
        data: [0.7, 0.68, 0.73, 0.7, 0.63],
        borderColor: 'rgba(15, 157, 88, 0.5)',
        backgroundColor: 'rgba(15, 157, 88, 0.1)',
        borderWidth: 1.5,
        pointRadius: 2,
        pointBackgroundColor: 'rgba(15, 157, 88, 0.5)'
      }
    ]
  }

  new Chart(ctx, {
    type: 'radar',
    data,
    options: {
      scales: {
        r: {
          beginAtZero: true,
          max: 1,
          ticks: {
            callback: value => `${(value * 100)}%`,
            stepSize: 0.2,
            backdropColor: 'transparent',
            color: 'rgba(0, 0, 0, 0.6)'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          angleLines: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          pointLabels: {
            font: {
              size: 11,
              family: "'Arial', sans-serif"
            },
            padding: 20,
            color: 'rgba(0, 0, 0, 0.7)'
          }
        }
      },
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            font: {
              size: 12,
              family: "'Arial', sans-serif"
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#333',
          bodyColor: '#333',
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${(context.raw * 100).toFixed(1)}%`
            }
          }
        }
      },
      elements: {
        line: {
          tension: 0.1
        }
      }
    }
  })
}
