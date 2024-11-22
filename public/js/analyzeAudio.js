let lastAnalysisResponse = null;

function hideAnalysisSection() {
  document.getElementById('analyze-drawing-section').style.display = 'none';
}

function showAnalysisSection() {
  document.getElementById('analyze-drawing-section').style.display = 'block';
}

function generateDrawingAnalysisSection(selectedUser) {
  const analysisSection = document.getElementById('analyze-drawing-section');
  analysisSection.innerHTML = `
    <h2>Drawing Analysis</h2>
    <div class="form-group">
      <input type="file" id="drawing-upload" accept="image/*" class="form-control">
      <div class="mt-3">
        <canvas id="student-drawing" width="800" height="600" style="display: none;"></canvas>
        <img id="uploaded-drawing" style="max-width: 800px; max-height: 600px; display: none;">
      </div>
    </div>
    <button id="submit-for-analysis" class="btn btn-primary" style="display: none;">Analyze Drawing</button>
    <div class="analysis-results" style="display: none;">
      <h3>Analysis Details</h3>
      <p id="analysis-details"></p>
    </div>
  `;
  addFadeInAnimation(analysisSection);

  document.getElementById('drawing-upload').addEventListener('change', handleDrawingUpload);
  document.getElementById('submit-for-analysis').addEventListener('click', submitForAnalysis);
}

function handleDrawingUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  const uploadedDrawing = document.getElementById('uploaded-drawing');
  const canvas = document.getElementById('student-drawing');
  const analyzeButton = document.getElementById('submit-for-analysis');

  reader.onload = function (e) {
    uploadedDrawing.src = e.target.result;
    uploadedDrawing.style.display = 'block';

    const img = new Image();
    img.onload = function () {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = e.target.result;

    analyzeButton.style.display = 'block';
  };

  reader.readAsDataURL(file);
}

function submitForAnalysis() {
  const canvas = document.getElementById('student-drawing');
  const analysisDetails = document.getElementById('analysis-details');
  const analysisResults = document.querySelector('.analysis-results');

  if (!canvas) {
    showNotification('Drawing canvas not found.', 'error');
    return;
  }

  const drawingData = canvas.toDataURL();
  if (!drawingData) {
    showNotification('No drawing to analyze.', 'error');
    return;
  }

  const userSelect = document.getElementById('user-select');
  const selectedUserId = userSelect.value;

  if (!selectedUserId) {
    showNotification('Please select a student first.', 'error');
    return;
  }

  const selectedUser = globalUsers.find(user => user.user.user_id.toString() === selectedUserId);
  if (!selectedUser) {
    showNotification('Selected user details not found.', 'error');
    return;
  }

  analysisDetails.textContent = 'Analyzing drawing...';
  analysisResults.style.display = 'block';

  fetch('/api/analyze-drawing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      drawingData,
      user: selectedUser
    })
  })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        lastAnalysisResponse = data;
        analysisDetails.innerHTML = data.drawingAnalysis;
      })
      .catch(error => {
        lastAnalysisResponse = null;
        console.error('Error analyzing drawing:', error);
        analysisDetails.textContent = 'Failed to analyze drawing. Please try again.';
        showNotification('Failed to analyze drawing. Please try again.', 'error');
      });
}
