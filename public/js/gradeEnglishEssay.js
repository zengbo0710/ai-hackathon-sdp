let lastGradingResponse = null;

document.addEventListener('DOMContentLoaded', () => {
  initializeGradingSection();
});

function initializeGradingSection() {
  const gradingSection = document.getElementById('essay-grading-section');
  gradingSection.innerHTML = generateGradingSectionHTML();
  addEventListeners();
}

function generateGradingSectionHTML() {
  return `
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
  `;
}

function addEventListeners() {
  document.getElementById('submit-for-grading').addEventListener('click', submitForGrading);
  document.getElementById('generate-improved-essay').addEventListener('click', generateImprovedEssay);
  document.getElementById('generate-essay-summary').addEventListener('click', generateEssaySummary);
}

function submitForGrading() {
  const essayTextarea = document.getElementById('student-essay');
  const gradingDetails = document.getElementById('grading-details');
  const gradingResults = document.querySelector('.grading-results');

  if (!essayTextarea) {
    showNotification('Essay textarea not found.', 'error');
    return;
  }

  const essay = essayTextarea.value.trim();
  if (!essay) {
    showNotification('Please enter an essay to grade.', 'error');
    return;
  }

  const selectedUser = getSelectedUser();
  if (!selectedUser) return;

  gradingDetails.textContent = 'Grading essay...';
  gradingResults.style.display = 'block';

  fetch('/api/grade-essay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ essay, user: selectedUser })
  })
      .then(response => response.json())
      .then(data => handleGradingResponse(data))
      .catch(error => handleError(error, 'grading essay', gradingDetails));
}

function handleGradingResponse(data) {
  if (data.error) throw new Error(data.error);
  lastGradingResponse = data;

  const gradingDetails = document.getElementById('grading-details');
  gradingDetails.innerHTML = formatGradingResponse(data);
  document.getElementById('generate-improved-essay').style.display = 'block';
  document.getElementById('generate-essay-summary').style.display = 'block';
}

function formatGradingResponse(data) {
  const rows = data.split('\n');
  let tableHTML = '<table class="grading-table"><thead><tr><th>Criteria</th><th>Score</th><th>Comments</th></tr></thead><tbody>';

  rows.forEach(row => {
    const [criteria, score, ...comments] = row.split('|');
    if (criteria && score) {
      tableHTML += `<tr><td>${criteria}</td><td>${score}</td><td>${comments.join('|')}</td></tr>`;
    }
  });

  tableHTML += '</tbody></table>';
  return tableHTML;
}

function generateImprovedEssay() {
  const essayTextarea = document.getElementById('student-essay');
  const improvedEssayElement = document.getElementById('improved-essay');
  const improvedEssaySection = document.getElementById('improved-essay-section');

  if (!essayTextarea || !improvedEssayElement) {
    showNotification('Required elements not found.', 'error');
    return;
  }

  const essay = essayTextarea.value.trim();
  if (!essay) {
    showNotification('No essay to improve.', 'error');
    return;
  }

  const selectedUser = getSelectedUser();
  if (!selectedUser) return;

  improvedEssaySection.style.display = 'block';
  improvedEssayElement.textContent = 'Generating improved version...';

  fetch('/api/improve-essay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ essay, user: selectedUser })
  })
      .then(response => response.json())
      .then(data => handleImprovedEssayResponse(data, improvedEssayElement))
      .catch(error => handleError(error, 'generating improved essay', improvedEssayElement));
}

function handleImprovedEssayResponse(data, element) {
  if (data.error) throw new Error(data.error);
  element.innerHTML = formatImprovedEssayResponse(data);
}

function formatImprovedEssayResponse(data) {
  return data.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [titlePart, content] = line.split('|');
        const title = titlePart.replace('[', '').replace(']', '').trim();
        return `<div class="essay-section"><p>${title}</p><p>${content.trim()}</p></div>`;
      })
      .join('');
}

function generateEssaySummary() {
  const essayTextarea = document.getElementById('student-essay');
  const essaySummaryElement = document.getElementById('essay-summary');
  const essaySummarySection = document.getElementById('essay-summary-section');

  if (!essayTextarea || !essaySummaryElement) {
    showNotification('Required elements not found.', 'error');
    return;
  }

  const essay = essayTextarea.value.trim();
  if (!essay) {
    showNotification('No essay to summarize.', 'error');
    return;
  }

  const selectedUser = getSelectedUser();
  if (!selectedUser) return;

  essaySummarySection.style.display = 'block';
  essaySummaryElement.textContent = 'Generating summary...';

  fetch('/api/summarize-essay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ essay, user: selectedUser, gradingResponse: lastGradingResponse })
  })
      .then(response => response.json())
      .then(data => handleEssaySummaryResponse(data, essaySummaryElement))
      .catch(error => handleError(error, 'generating essay summary', essaySummaryElement));
}

function handleEssaySummaryResponse(data, element) {
  if (data.error) throw new Error(data.error);
  element.innerHTML = data;
}

function getSelectedUser() {
  const userSelect = document.getElementById('user-select');
  const selectedUserId = userSelect.value;

  if (!selectedUserId) {
    showNotification('Please select a student first.', 'error');
    return null;
  }

  const selectedUser = globalUsers.find(user => user.user.user_id.toString() === selectedUserId);
  if (!selectedUser) {
    showNotification('Selected user details not found.', 'error');
    return null;
  }

  return selectedUser;
}

function handleError(error, action, element) {
  lastGradingResponse = null;
  console.error(`Error ${action}:`, error);
  element.textContent = `Failed to ${action}. Please try again.`;
  showNotification(`Failed to ${action}. Please try again.`, 'error');
}

function showNotification(message, type = 'info') {
  const notificationContainer = document.getElementById('notification-container') || createNotificationContainer();
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `<span class="notification-message">${message}</span><button class="notification-close">&times;</button>`;

  notificationContainer.appendChild(notification);
  notification.querySelector('.notification-close').addEventListener('click', () => notification.remove());
  setTimeout(() => notification.remove(), 5000);
}

function createNotificationContainer() {
  const container = document.createElement('div');
  container.id = 'notification-container';
  document.body.appendChild(container);
  return container;
}