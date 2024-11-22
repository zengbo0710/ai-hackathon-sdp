let globalUsers = []

document.addEventListener('DOMContentLoaded', () => {
  const manageEvidencesLink = document.getElementById('manage-evidences-link')
  const showDetailsLink = document.getElementById('show-details-link')
  const generateSummaryLink = document.getElementById('generate-summary-link')
  const manageEvidencesView = document.getElementById('manage-evidences-view')
  const showDetailsView = document.getElementById('show-details-view')
  const generateSummaryView = document.getElementById('generate-summary-view')
  const contentArea = document.querySelector('.content-area')
  const userSelectContainer = document.getElementById('user-select-container')
  const userSelect = document.getElementById('user-select')
  const gradeEnglishEssayLink = document.getElementById('grade-english-essay-link')
  const gradeEnglishEssayView = document.getElementById('grade-english-essay-view')
  const analyzeDrawingLink = document.getElementById('analyze-drawing-link')
  const analyzeDrawingView = document.getElementById('analyze-drawing-view')

  const switchToManageEvidences = () => {
    manageEvidencesView.style.display = 'block'
    showDetailsView.style.display = 'none'
    generateSummaryView.style.display = 'none'
    gradeEnglishEssayView.style.display = 'none'
    analyzeDrawingView.style.display = 'none'
    contentArea.style.display = 'none'
    userSelectContainer.style.display = 'none'
    manageEvidencesLink.classList.add('active')
    showDetailsLink.classList.remove('active')
    generateSummaryLink.classList.remove('active')
    gradeEnglishEssayLink.classList.remove('active')
    analyzeDrawingLink.classList.remove('active')
  }

  const switchToShowDetails = () => {
    manageEvidencesView.style.display = 'none'
    showDetailsView.style.display = 'block'
    generateSummaryView.style.display = 'none'
    gradeEnglishEssayView.style.display = 'none'
    analyzeDrawingView.style.display = 'none'
    contentArea.style.display = 'block'
    userSelectContainer.style.display = 'block'
    showDetailsLink.classList.add('active')
    manageEvidencesLink.classList.remove('active')
    generateSummaryLink.classList.remove('active')
    gradeEnglishEssayLink.classList.remove('active')
    analyzeDrawingLink.classList.remove('active')

    if (!userSelect.value) {
      hideUserDetails()
      showWelcomeMessage('show-details-view', 'User Details')
    }
  }

  const switchToGenerateSummary = () => {
    manageEvidencesView.style.display = 'none'
    showDetailsView.style.display = 'none'
    generateSummaryView.style.display = 'block'
    gradeEnglishEssayView.style.display = 'none'
    analyzeDrawingView.style.display = 'none'
    contentArea.style.display = 'none'
    userSelectContainer.style.display = 'block'
    generateSummaryLink.classList.add('active')
    showDetailsLink.classList.remove('active')
    manageEvidencesLink.classList.remove('active')
    gradeEnglishEssayLink.classList.remove('active')
    analyzeDrawingLink.classList.remove('active')
    if (!userSelect.value) {
      hideSummaryDetails()
      showWelcomeMessage('generate-summary-view', 'Student Development Profile')
    }
  }

  const switchToGradeEnglishEssay = () => {
    manageEvidencesView.style.display = 'none'
    showDetailsView.style.display = 'none'
    generateSummaryView.style.display = 'none'
    gradeEnglishEssayView.style.display = 'block'
    analyzeDrawingView.style.display = 'none'
    contentArea.style.display = 'none'
    userSelectContainer.style.display = 'block'
    gradeEnglishEssayLink.classList.add('active')
    showDetailsLink.classList.remove('active')
    manageEvidencesLink.classList.remove('active')
    generateSummaryLink.classList.remove('active')
    analyzeDrawingLink.classList.remove('active')

    if (!userSelect.value) {
      hideGradingSection()
      showWelcomeMessage('grade-english-essay-view', 'Grade English Essay')
    }
  }

  const switchToAnalyzeDrawing = () => {
    manageEvidencesView.style.display = 'none'
    showDetailsView.style.display = 'none'
    generateSummaryView.style.display = 'none'
    gradeEnglishEssayView.style.display = 'none'
    analyzeDrawingView.style.display = 'block'
    contentArea.style.display = 'none'
    userSelectContainer.style.display = 'block'
    analyzeDrawingLink.classList.add('active')
    showDetailsLink.classList.remove('active')
    manageEvidencesLink.classList.remove('active')
    generateSummaryLink.classList.remove('active')
    gradeEnglishEssayLink.classList.remove('active')

    if (!userSelect.value) {
      hideAnalysisSection()
      showWelcomeMessage('analyze-drawing-view', 'Analyze Drawing')
    }
  }

  switchToShowDetails()

  manageEvidencesLink.addEventListener('click', (e) => {
    e.preventDefault()
    userSelect.value = 'Select a student'
    triggerUserSelectChange()
    switchToManageEvidences()
  })

  showDetailsLink.addEventListener('click', (e) => {
    e.preventDefault()
    userSelect.value = 'Select a student'
    triggerUserSelectChange()
    switchToShowDetails()
  })

  generateSummaryLink.addEventListener('click', (e) => {
    e.preventDefault()
    userSelect.value = 'Select a student'
    triggerUserSelectChange()
    switchToGenerateSummary()
  })

  gradeEnglishEssayLink.addEventListener('click', (e) => {
    e.preventDefault()
    userSelect.value = 'Select a student'
    triggerUserSelectChange()
    switchToGradeEnglishEssay()
  })

  analyzeDrawingLink.addEventListener('click', (e) => {
    e.preventDefault()
    userSelect.value = 'Select a student'
    triggerUserSelectChange()
    switchToAnalyzeDrawing()
  })

  fetchUsers()

  const triggerUserSelectChange = () => {
    fetchUsers()
    userSelect.dispatchEvent(new Event('change'))
  }

  userSelect.addEventListener('change', (e) => {
    const selectedUserId = e.target.value
    if (selectedUserId) {
      const selectedUser = globalUsers.find(user => user.user.user_id.toString() === selectedUserId)
      if (selectedUser) {
        hideWelcomeMessage()
        const currentView = getCurrentView()
        switch (currentView) {
          case 'show-details-view':
            showUserDetails()
            displayUserInfo(selectedUser.user)
            displayRadarChart(selectedUser.user)
            displaySummary(selectedUser.schema.summary)
            displayImpact(selectedUser.schema.impact)
            displayBehaviours(selectedUser.schema.behaviour)
            break
          case 'generate-summary-view':
            showSummaryDetails()
            generateUserSummaryInfo(selectedUser.schema.summary)
            break
          case 'grade-english-essay-view':
            showGradingSection()
            generateEssayGradingSection(selectedUser)
            break
          case 'analyze-drawing-view':
            showAnalysisSection()
            generateDrawingAnalysisSection(selectedUser)
            break
        }
      }
    } else {
      hideAllDetails()
      const currentView = getCurrentView()
      const message = getWelcomeMessage(currentView)
      showWelcomeMessage(currentView, message)
    }
  })

  // Helper functions
  function getCurrentView () {
    if (document.querySelector('#show-details-view').style.display === 'block') return 'show-details-view'
    if (document.querySelector('#generate-summary-view').style.display === 'block') return 'generate-summary-view'
    if (document.querySelector('#grade-english-essay-view').style.display === 'block') return 'grade-english-essay-view'
    if (document.querySelector('#analyze-drawing-view').style.display === 'block') return 'analyze-drawing-view'
    return 'manage-evidences-view'
  }

  function getWelcomeMessage (view) {
    switch (view) {
      case 'show-details-view': return 'User Details'
      case 'generate-summary-view': return 'Generate Summary'
      case 'grade-english-essay-view': return 'Grade English Essay'
      case 'analyze-drawing-view': return 'Analyze Drawing'
      default: return ''
    }
  }

  function hideAllDetails () {
    hideUserDetails()
    hideSummaryDetails()
    hideGradingSection()
    hideAnalysisSection()
  }
})

function fetchUsers () {
  fetch('/api/users')
    .then(response => response.json())
    .then(users => {
      globalUsers = users
      populateUserSelect(users)
    })
    .catch(error => console.error('Error fetching users:', error))
}

function populateUserSelect (users) {
  const userSelect = document.getElementById('user-select')
  userSelect.innerHTML = '<option value="">Select a student</option>'
  users.forEach(user => {
    const option = document.createElement('option')
    option.value = user.user.user_id
    option.textContent = `${user.user.name} (${user.user.role})`
    userSelect.appendChild(option)
  })
}

function addFadeInAnimation (element) {
  element.classList.add('animate__animated', 'animate__fadeIn')
}
