  // Backend API endpoints (replace with your actual backend URLs)
        const API_BASE_URL = 'https://your-backend-domain.com/api';
        const ENDPOINTS = {
            SUBJECTS: `${API_BASE_URL}/subjects`,
            MATERIALS: `${API_BASE_URL}/materials`,
            QUIZZES: `${API_BASE_URL}/quizzes`,
            UPLOAD: `${API_BASE_URL}/upload`
        };

        // Current state
        let currentSubject = null;
        let currentQuizIndex = 0;
        let selectedOption = null;
        let quizScore = 0;
        let subjects = [];
        let studyData = {};
        let quizData = {};

        // DOM elements
        const studyMaterialContainer = document.getElementById('study-material');
        const subjectListContainer = document.getElementById('subject-list');
        const subjectTitle = document.getElementById('current-subject-title');
        const subjectProgress = document.getElementById('subject-progress');
        const subjectProgressText = document.getElementById('subject-progress-text');
        const overallProgress = document.getElementById('overall-progress');
        const overallProgressBar = document.getElementById('overall-progress-bar');
        const quizContainer = document.getElementById('quiz-container');
        const quizQuestion = document.getElementById('quiz-question');
        const quizOptions = document.getElementById('quiz-options');
        const prevQuestionBtn = document.getElementById('prev-question');
        const nextQuestionBtn = document.getElementById('next-question');
        const uploadModal = document.getElementById('upload-modal');
        const openUploadModalBtn = document.getElementById('open-upload-modal');
        const closeModalBtn = document.getElementById('close-modal');
        const uploadForm = document.getElementById('upload-form');
        const materialSubjectSelect = document.getElementById('material-subject');
        const fileInput = document.getElementById('material-file');
        const fileInputLabel = document.getElementById('file-input-label');
        const filePreview = document.getElementById('file-preview');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        const submitBtn = document.getElementById('submit-btn');
        const loadingMaterials = document.getElementById('loading-materials');
        const errorContainer = document.getElementById('error-container');

        // Initialize the app
        async function init() {
            try {
                await loadSubjects();
                setupEventListeners();
            } catch (error) {
                showError('Failed to initialize app. Please refresh the page.');
                console.error('Initialization error:', error);
            }
        }

        // Load subjects from backend
        async function loadSubjects() {
            try {
                // In a real app, this would be a fetch call to your backend
                // const response = await fetch(ENDPOINTS.SUBJECTS);
                // subjects = await response.json();
                
                // For demo purposes, we'll use mock data
                subjects = ['HTML', 'CSS', 'JAVASCRIPT', 'PYTHON', 'DBMS', 'DSA'];
                
                renderSubjectList();
                populateSubjectSelect();
                
                // Load materials for the first subject if available
                if (subjects.length > 0) {
                    await selectSubject(subjects[0]);
                }
            } catch (error) {
                console.error('Error loading subjects:', error);
                throw error;
            }
        }

        // Render subject list in sidebar
        function renderSubjectList() {
            subjectListContainer.innerHTML = '';
            subjects.forEach(subject => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = subject;
                a.setAttribute('data-subject', subject);
                if (subject === currentSubject) {
                    a.classList.add('active');
                }
                li.appendChild(a);
                subjectListContainer.appendChild(li);
            });
        }

        // Populate subject select in upload modal
        function populateSubjectSelect() {
            materialSubjectSelect.innerHTML = '<option value="">Select subject</option>';
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                materialSubjectSelect.appendChild(option);
            });
        }

        // Select a subject and load its materials
        async function selectSubject(subject) {
            try {
                currentSubject = subject;
                subjectTitle.textContent = subject;
                
                // Update active subject in sidebar
                document.querySelectorAll('.subject-list a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-subject') === subject) {
                        link.classList.add('active');
                    }
                });
                
                // Show loading state
                studyMaterialContainer.innerHTML = '';
                loadingMaterials.style.display = 'flex';
                
                // Load materials for this subject
                await loadMaterials(subject);
                
                // Hide loading state
                loadingMaterials.style.display = 'none';
                
                // Render materials
                renderStudyMaterial(subject);
                
                // Reset quiz if active
                if (!quizContainer.classList.contains('hidden')) {
                    quizContainer.classList.add('hidden');
                }
            } catch (error) {
                showError(`Failed to load materials for ${subject}`);
                console.error('Error selecting subject:', error);
            }
        }

        // Load materials for a subject from backend
        async function loadMaterials(subject) {
            try {
                // In a real app, this would be a fetch call to your backend
                // const response = await fetch(`${ENDPOINTS.MATERIALS}?subject=${subject}`);
                // studyData[subject] = await response.json();
                
                // For demo purposes, we'll use mock data
                if (!studyData[subject]) {
                    // Simulate API delay
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Mock data based on subject
                    studyData[subject] = [
                        {
                            id: 1,
                            title: `${subject} Basics`,
                            type: "Video",
                            description: `Introduction to ${subject} concepts`,
                            duration: "15 min",
                            completed: Math.random() > 0.5
                        },
                        {
                            id: 2,
                            title: `${subject} Advanced Topics`,
                            type: "Notes",
                            description: `Advanced concepts in ${subject}`,
                            duration: "20 min",
                            completed: Math.random() > 0.5
                        },
                        {
                            id: 3,
                            title: `${subject} Practical Examples`,
                            type: "Interactive",
                            description: `Hands-on examples with ${subject}`,
                            duration: "25 min",
                            completed: Math.random() > 0.5
                        }
                    ];
                }
            } catch (error) {
                console.error(`Error loading materials for ${subject}:`, error);
                throw error;
            }
        }

        // Set up event listeners
        function setupEventListeners() {
            // Subject navigation
            document.addEventListener('click', function(e) {
                if (e.target.matches('.subject-list a')) {
                    e.preventDefault();
                    const subject = e.target.getAttribute('data-subject');
                    selectSubject(subject);
                }
            });

            // Quiz navigation
            prevQuestionBtn.addEventListener('click', goToPreviousQuestion);
            nextQuestionBtn.addEventListener('click', goToNextQuestion);

            // Upload modal
            openUploadModalBtn.addEventListener('click', openUploadModal);
            closeModalBtn.addEventListener('click', closeUploadModal);

            // Close modal when clicking outside
            window.addEventListener('click', function(e) {
                if (e.target === uploadModal) {
                    closeUploadModal();
                }
            });

            // File input change
            fileInput.addEventListener('change', handleFileSelect);

            // Form submission
            uploadForm.addEventListener('submit', handleFormSubmit);
        }

        // Render study material for a subject
        function renderStudyMaterial(subject) {
            const materials = studyData[subject] || [];
            studyMaterialContainer.innerHTML = '';
            
            if (materials.length === 0) {
                studyMaterialContainer.innerHTML = '<p>No study materials available for this subject yet.</p>';
                return;
            }
            
            // Calculate progress
            const completedCount = materials.filter(material => material.completed).length;
            const progressPercentage = materials.length > 0 ? (completedCount / materials.length) * 100 : 0;
            
            // Update progress display
            subjectProgress.style.width = `${progressPercentage}%`;
            subjectProgressText.textContent = `${Math.round(progressPercentage)}% Complete`;
            
            // Update overall progress
            updateOverallProgress();
            
            // Create material cards
            materials.forEach(material => {
                const card = document.createElement('div');
                card.className = 'material-card';
                
                card.innerHTML = `
                    <button class="delete-btn" data-id="${material.id}">&times;</button>
                    <div class="card-header">
                        <span>${material.type}</span>
                        <span class="card-type">${material.duration}</span>
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${material.title}</h3>
                        <p class="card-description">${material.description}</p>
                    </div>
                    <div class="card-footer">
                        ${material.completed ? 
                            '<span class="completed">Completed</span>' : 
                            '<button class="btn btn-primary study-btn">Start</button>'
                        }
                        <button class="btn btn-outline quiz-btn">Quick Quiz</button>
                    </div>
                `;
                
                studyMaterialContainer.appendChild(card);
            });
            
            // Add event listeners to buttons
            document.querySelectorAll('.study-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const card = this.closest('.material-card');
                    const title = card.querySelector('.card-title').textContent;
                    markMaterialAsCompleted(card, title);
                });
            });
            
            document.querySelectorAll('.quiz-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    startQuiz();
                });
            });

            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const materialId = parseInt(this.getAttribute('data-id'));
                    deleteMaterial(materialId);
                });
            });
        }

        // Mark material as completed
        async function markMaterialAsCompleted(card, title) {
            try {
                // In a real app, this would be a PATCH request to your backend
                // await fetch(`${ENDPOINTS.MATERIALS}/${materialId}`, {
                //     method: 'PATCH',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ completed: true })
                // });
                
                // For demo, we'll just update the UI
                card.querySelector('.card-footer').innerHTML = '<span class="completed">Completed</span>';
                
                // Update progress
                renderStudyMaterial(currentSubject);
                
                alert(`Completed: ${title}`);
            } catch (error) {
                showError('Failed to mark material as completed');
                console.error('Error marking material as completed:', error);
            }
        }

        // Delete material
        async function deleteMaterial(materialId) {
            if (confirm('Are you sure you want to delete this material?')) {
                try {
                    // In a real app, this would be a DELETE request to your backend
                    // await fetch(`${ENDPOINTS.MATERIALS}/${materialId}`, { method: 'DELETE' });
                    
                    // For demo, we'll just remove from local data
                    const materials = studyData[currentSubject];
                    const materialIndex = materials.findIndex(m => m.id === materialId);
                    
                    if (materialIndex !== -1) {
                        materials.splice(materialIndex, 1);
                        renderStudyMaterial(currentSubject);
                    }
                } catch (error) {
                    showError('Failed to delete material');
                    console.error('Error deleting material:', error);
                }
            }
        }

        // Update overall progress
        function updateOverallProgress() {
            let totalMaterials = 0;
            let completedMaterials = 0;
            
            Object.values(studyData).forEach(materials => {
                totalMaterials += materials.length;
                completedMaterials += materials.filter(m => m.completed).length;
            });
            
            const overallPercentage = totalMaterials > 0 ? (completedMaterials / totalMaterials) * 100 : 0;
            overallProgress.textContent = `${Math.round(overallPercentage)}%`;
            overallProgressBar.style.width = `${overallPercentage}%`;
        }

        // Open upload modal
        function openUploadModal() {
            uploadModal.style.display = 'flex';
        }

        // Close upload modal
        function closeUploadModal() {
            uploadModal.style.display = 'none';
            uploadForm.reset();
            filePreview.style.display = 'none';
            fileInputLabel.textContent = 'Choose a file';
        }

        // Handle file selection
        function handleFileSelect(e) {
            const file = e.target.files[0];
            if (file) {
                fileName.textContent = file.name;
                fileSize.textContent = formatFileSize(file.size);
                filePreview.style.display = 'block';
                fileInputLabel.textContent = 'Change file';
            } else {
                filePreview.style.display = 'none';
                fileInputLabel.textContent = 'Choose a file';
            }
        }

        // Format file size
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Handle form submission
        async function handleFormSubmit(e) {
            e.preventDefault();
            
            const title = document.getElementById('material-title').value;
            const subject = document.getElementById('material-subject').value;
            const type = document.getElementById('material-type').value;
            const description = document.getElementById('material-description').value;
            const duration = document.getElementById('material-duration').value;
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Please select a file to upload');
                return;
            }
            
            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Uploading...';
            
            try {
                // In a real app, this would be a POST request with FormData
                // const formData = new FormData();
                // formData.append('title', title);
                // formData.append('subject', subject);
                // formData.append('type', type);
                // formData.append('description', description);
                // formData.append('duration', duration);
                // formData.append('file', file);
                
                // const response = await fetch(ENDPOINTS.UPLOAD, {
                //     method: 'POST',
                //     body: formData
                // });
                
                // if (!response.ok) {
                //     throw new Error('Upload failed');
                // }
                
                // const newMaterial = await response.json();
                
                // For demo, we'll simulate a successful upload
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const newMaterial = {
                    id: Date.now(), // Use timestamp as ID for demo
                    title: title,
                    type: type,
                    description: description,
                    duration: duration ? `${duration} min` : 'N/A',
                    completed: false
                };
                
                // Add to local data
                if (!studyData[subject]) {
                    studyData[subject] = [];
                }
                
                studyData[subject].push(newMaterial);
                
                // If we're currently viewing this subject, update the display
                if (currentSubject === subject) {
                    renderStudyMaterial(subject);
                }
                
                // Close modal and reset form
                closeUploadModal();
                
                alert('Material uploaded successfully!');
            } catch (error) {
                showError('Failed to upload material. Please try again.');
                console.error('Upload error:', error);
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Upload Material';
            }
        }

        // Show error message
        function showError(message) {
            errorContainer.innerHTML = `
                <div class="error-message">
                    <strong>Error:</strong> ${message}
                </div>
            `;
            
            // Auto-hide error after 5 seconds
            setTimeout(() => {
                errorContainer.innerHTML = '';
            }, 5000);
        }

        // Start quiz for current subject
        async function startQuiz() {
            try {
                // Load quiz data if not already loaded
                if (!quizData[currentSubject]) {
                    // In a real app, this would be a fetch call to your backend
                    // const response = await fetch(`${ENDPOINTS.QUIZZES}?subject=${currentSubject}`);
                    // quizData[currentSubject] = await response.json();
                    
                    // For demo, we'll use mock data
                    quizData[currentSubject] = [
                        {
                            question: `What is the main purpose of ${currentSubject}?`,
                            options: [
                                "To create beautiful designs",
                                "To add functionality to websites",
                                "To manage databases",
                                "All of the above"
                            ],
                            correct: 1
                        },
                        {
                            question: `Which of these is a key feature of ${currentSubject}?`,
                            options: [
                                "Variables and functions",
                                "Colors and fonts",
                                "Tables and relationships",
                                "All of the above"
                            ],
                            correct: 0
                        }
                    ];
                }
                
                if (!quizData[currentSubject] || quizData[currentSubject].length === 0) {
                    alert('No quiz available for this subject yet!');
                    return;
                }
                
                quizContainer.classList.remove('hidden');
                currentQuizIndex = 0;
                quizScore = 0;
                renderQuizQuestion();
            } catch (error) {
                showError('Failed to load quiz');
                console.error('Error starting quiz:', error);
            }
        }
        // Render current quiz question
        function renderQuizQuestion() {
            const quiz = quizData[currentSubject];
            const currentQuestion = quiz[currentQuizIndex];
            
            quizQuestion.textContent = currentQuestion.question;
            quizOptions.innerHTML = '';
            
            currentQuestion.options.forEach((option, index) => {
                const li = document.createElement('li');
                li.textContent = option;
                li.setAttribute('data-index', index);
                
                if (selectedOption === index) {
                    li.classList.add('selected');
                }
                
                li.addEventListener('click', function() {
                    // Deselect previous option
                    document.querySelectorAll('.quiz-options li').forEach(item => {
                        item.classList.remove('selected');
                    });
                    
                    // Select this option
                    this.classList.add('selected');
                    selectedOption = parseInt(this.getAttribute('data-index'));
                });
                
                quizOptions.appendChild(li);
            });
            
            // Update navigation buttons
            prevQuestionBtn.disabled = currentQuizIndex === 0;
            nextQuestionBtn.textContent = currentQuizIndex === quiz.length - 1 ? 'Finish' : 'Next';
        }

        // Go to previous question
        function goToPreviousQuestion() {
            if (currentQuizIndex > 0) {
                currentQuizIndex--;
                selectedOption = null;
                renderQuizQuestion();
            }
        }

        // Go to next question or finish quiz
        function goToNextQuestion() {
            const quiz = quizData[currentSubject];
            
            // Check if answer is selected
            if (selectedOption === null) {
                alert('Please select an answer!');
                return;
            }
            
            // Check if answer is correct
            if (selectedOption === quiz[currentQuizIndex].correct) {
                quizScore++;
            }
            
            // Move to next question or finish
            if (currentQuizIndex < quiz.length - 1) {
                currentQuizIndex++;
                selectedOption = null;
                renderQuizQuestion();
            } else {
                // Finish quiz
                alert(`Quiz completed! Your score: ${quizScore}/${quiz.length}`);
                quizContainer.classList.add('hidden');
                
                // In a real app, you might want to save the quiz results to the backend
                // saveQuizResults(quizScore, quiz.length);
            }
        }

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);
