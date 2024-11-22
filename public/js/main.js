let globalUsers = [];

document.addEventListener('DOMContentLoaded', () => {
  initializeNavigation();
  fetchUsers();
  switchToShowDetails();
});

function initializeNavigation() {
  const manageEvidencesLink = document.getElementById('manage-evidences-link');
  const showDetailsLink = document.getElementById('show-details-link');
  const generateSummaryLink = document.getElementById('generate-summary-link');
  const gradeEnglishEssayLink = document.getElementById('grade-english-essay-link');
  const analyzeDrawingLink = document.getElementById('analyze-drawing-link');
  const userSelect = document.getElementById('user-select');

  manageEvidencesLink.addEventListener('click', (e) => handleNavigation(e, switchToManageEvidences));
  showDetailsLink.addEventListener('click', (e) => handleNavigation(e, switchToShowDetails));
  generateSummaryLink.addEventListener('click', (e) => handleNavigation(e, switchToGenerateSummary));
  gradeEnglishEssayLink.addEventListener('click', (e) => handleNavigation(e, switchToGradeEnglishEssay));
  analyzeDrawingLink.addEventListener('click', (e) => handleNavigation(e, switchToAnalyzeDrawing));

  userSelect.addEventListener('change', handleUserSelectChange);
}

function handleNavigation(event, switchFunction) {
  event.preventDefault();
  document.getElementById('user-select').value = 'Select a student';
  triggerUserSelectChange();
  switchFunction();
}

function switchToManageEvidences() {
  toggleView('manage-evidences-view');
}

function switchToShowDetails() {
  toggleView('show-details-view');
  if (!document.getElementById('user-select').value) {
    hideUserDetails();
    showWelcomeMessage('show-details-view', 'User Details');
  }
}

function switchToGenerateSummary() {
  toggleView('generate-summary-view');
  if (!document.getElementById('user-select').value) {
    hideSummaryDetails();
    showWelcomeMessage('generate-summary-view', 'Generate Summary');
  }
}

function switchToGradeEnglishEssay() {
  toggleView('grade-english-essay-view');
  if (!document.getElementById('user-select').value) {
    hideGradingSection();
    showWelcomeMessage('grade-english-essay-view', 'Grade English Essay');
  }
}

function switchToAnalyzeDrawing() {
  toggleView('analyze-drawing-view');
  if (!document.getElementById('user-select').value) {
    hideAnalysisSection();
    showWelcomeMessage('analyze-drawing-view', 'Analyze Drawing');
  }
}

function toggleView(viewId) {
  const views = ['manage-evidences-view', 'show-details-view', 'generate-summary-view', 'grade-english-essay-view', 'analyze-drawing-view'];
  views.forEach(id => document.getElementById(id).style.display = id === viewId ? 'block' : 'none');
  document.querySelector('.content-area').style.display = viewId === 'show-details-view' ? 'block' : 'none';
  document.getElementById('user-select-container').style.display = viewId === 'show-details-view' ? 'block' : 'none';
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  document.querySelector(`#${viewId.replace('-view', '-link')}`).classList.add('active');
}

function handleUserSelectChange(event) {
  const selectedUserId = event.target.value;
  if (selectedUserId) {
    const selectedUser = globalUsers.find(user => user.user.user_id.toString() === selectedUserId);
    if (selectedUser) {
      hideWelcomeMessage();
      const currentView = getCurrentView();
      switch (currentView) {
        case 'show-details-view':
          showUserDetails();
          displayUserInfo(selectedUser.user);
          displayRadarChart(selectedUser.user);
          displaySummary(selectedUser.schema.summary);
          displayImpact(selectedUser.schema.impact);
          displayBehaviours(selectedUser.schema.behaviour);
          break;
        case 'generate-summary-view':
          showSummaryDetails();
          generateUserSummaryInfo(selectedUser.schema.summary);
          break;
        case 'grade-english-essay-view':
          showGradingSection();
          generateEssayGradingSection(selectedUser);
          break;
        case 'analyze-drawing-view':
          showAnalysisSection();
          generateDrawingAnalysisSection(selectedUser);
          break;
      }
    }
  } else {
    hideAllDetails();
    const currentView = getCurrentView();
    const message = getWelcomeMessage(currentView);
    showWelcomeMessage(currentView, message);
  }
}

function getCurrentView() {
  const views = ['show-details-view', 'generate-summary-view', 'grade-english-essay-view', 'analyze-drawing-view'];
  return views.find(view => document.getElementById(view).style.display === 'block') || 'manage-evidences-view';
}

function getWelcomeMessage(view) {
  const messages = {
    'show-details-view': 'User Details',
    'generate-summary-view': 'Generate Summary',
    'grade-english-essay-view': 'Grade English Essay',
    'analyze-drawing-view': 'Analyze Drawing'
  };
  return messages[view] || '';
}

function hideAllDetails() {
  hideUserDetails();
  hideSummaryDetails();
  hideGradingSection();
  hideAnalysisSection();
}

function fetchUsers() {
  fetch('/api/users')
      .then(response => response.json())
      .then(users => {
        globalUsers = users;
        populateUserSelect(users);
      })
      .catch(error => console.error('Error fetching users:', error));
}

function populateUserSelect(users) {
  const userSelect = document.getElementById('user-select');
  userSelect.innerHTML = '<option value="">Select a student</option>';
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.user.user_id;
    option.textContent = `${user.user.name} (${user.user.role})`;
    userSelect.appendChild(option);
  });
}

function triggerUserSelectChange() {
  fetchUsers();
  document.getElementById('user-select').dispatchEvent(new Event('change'));
}

function addFadeInAnimation(element) {
  element.classList.add('animate__animated', 'animate__fadeIn');
}