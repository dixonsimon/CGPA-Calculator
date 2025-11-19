// --- SUBJECT DATA ---
    const subjects = [
        { name: "Web and UI/UX", credits: 3 },
        { name: "Elements of Linear Algebra", credits: 2 },
        { name: "Programming with C", credits: 4 },
        { name: "Linux and Shell Programming", credits: 3 },
        { name: "Universal Human Values", credits: 2 },
        { name: "Digital Logic and Comp Org", credits: 3 },
        { name: "Structure Innovation & Design", credits: 3 }
    ];

    const MAX_MARKS = 70;
    let selectedSemester = null;

    // --- INITIALIZATION ---
    document.addEventListener('DOMContentLoaded', function() {
        renderSubjectInputs();
        setupDropdown();
    });

    function renderSubjectInputs() {
        const container = document.getElementById('subjectContainer');
        container.innerHTML = '';
        
        subjects.forEach((sub, index) => {
            const row = document.createElement('div');
            row.className = 'subject-row';
            row.innerHTML = `
                <div class="info">
                    <span class="sub-name">${sub.name}</span>
                    <span class="sub-credit">${sub.credits} Credits</span>
                </div>
                <div class="input-group">
                    <input type="number" id="sub-${index}" min="0" max="70" placeholder="0" oninput="validateInput(this)">
                    <span class="max-marks">/70</span>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // --- CUSTOM DROPDOWN LOGIC ---
    function setupDropdown() {
        const dropdownHeader = document.getElementById('dropdownHeader');
        const dropdownList = document.getElementById('dropdownList');
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        const dropdownArrow = document.querySelector('.dropdown-arrow');
        
        // Toggle dropdown on header click
        dropdownHeader.addEventListener('click', function() {
            dropdownList.classList.toggle('active');
            dropdownHeader.classList.toggle('active');
            dropdownArrow.classList.toggle('active');
        });
        
        // Handle item selection
        dropdownItems.forEach(item => {
            item.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                const semesterName = this.querySelector('.semester-name').textContent;
                const semesterStatus = this.querySelector('.semester-status').textContent;
                
                // Update selected semester
                selectedSemester = value;
                
                // Update header text
                document.getElementById('selectedSemester').textContent = semesterName;
                
                // Update active state
                dropdownItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Close dropdown
                dropdownList.classList.remove('active');
                dropdownHeader.classList.remove('active');
                dropdownArrow.classList.remove('active');
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!dropdownHeader.contains(event.target) && !dropdownList.contains(event.target)) {
                dropdownList.classList.remove('active');
                dropdownHeader.classList.remove('active');
                dropdownArrow.classList.remove('active');
            }
        });
    }

    // --- HELPER: Auto-validate input color ---
    function validateInput(input) {
        const val = parseFloat(input.value);
        if (val > MAX_MARKS || val < 0) {
            input.style.color = '#ef4444'; 
        } else {
            input.style.color = 'white';
        }
    }

    // --- NAVIGATION LOGIC ---
    function startCalculator() {
        if (!selectedSemester) {
            alert("Please select a semester first!");
            return;
        }
        
        const selScreen = document.getElementById('selectionScreen');
        const calcScreen = document.getElementById('calculatorScreen');
        const comingSoonScreen = document.getElementById('comingSoonScreen');
        
        selScreen.style.display = 'none';
        
        if (selectedSemester === "1") {
            calcScreen.style.display = 'block';
            comingSoonScreen.style.display = 'none';
        } else {
            calcScreen.style.display = 'none';
            comingSoonScreen.style.display = 'block';
        }
    }

    function goBackToSelection() {
        const selScreen = document.getElementById('selectionScreen');
        const comingSoonScreen = document.getElementById('comingSoonScreen');
        const resultScreen = document.getElementById('resultScreen');
        
        selScreen.style.display = 'block';
        comingSoonScreen.style.display = 'none';
        resultScreen.style.display = 'none';
    }

    function recalculate() {
        const calcScreen = document.getElementById('calculatorScreen');
        const resultScreen = document.getElementById('resultScreen');

        // Hide Result
        resultScreen.style.display = 'none';

        // Show Form and Remove Collapse Class
        calcScreen.style.display = 'block';
        setTimeout(() => {
            calcScreen.classList.remove('collapsed-form');
        }, 50);
    }

    // --- CALCULATION LOGIC ---
    function calculateGPA() {
        let totalWeightedPoints = 0;
        let totalCredits = 0;
        let hasError = false;
        let detailedScores = [];

        subjects.forEach((sub, index) => {
            const input = document.getElementById(`sub-${index}`);
            let marks = parseFloat(input.value);

            if (isNaN(marks)) marks = 0; 

            if (marks < 0 || marks > MAX_MARKS) {
                input.parentElement.style.borderColor = '#ef4444';
                hasError = true;
            } else {
                input.parentElement.style.borderColor = 'transparent';
                
                let percentage = (marks / MAX_MARKS) * 100;
                
                // Grade Point (Standard 10pt scale)
                let gradePoint = 0;
                if (percentage >= 90) gradePoint = 10;
                else if (percentage >= 80) gradePoint = 9;
                else if (percentage >= 70) gradePoint = 8;
                else if (percentage >= 60) gradePoint = 7;
                else if (percentage >= 50) gradePoint = 6;
                else if (percentage >= 40) gradePoint = 5;
                else gradePoint = 0;

                totalWeightedPoints += (gradePoint * sub.credits);
                totalCredits += sub.credits;

                // Store data for AI analysis
                detailedScores.push({
                    name: sub.name,
                    credits: sub.credits,
                    marks: marks,
                    gradePoint: gradePoint,
                    percentage: percentage,
                    // "Lost Potential" calculation: How much this subject hurt the total score
                    // Calculated as: Credits * (10 - GradePoint)
                    lostPotential: sub.credits * (10 - gradePoint) 
                });
            }
        });

        if (hasError) {
            alert("Some marks are invalid (must be between 0 and 70).");
            return;
        }

        const gpa = totalWeightedPoints / totalCredits;
        
        // Display Results
        const calcScreen = document.getElementById('calculatorScreen');
        const resultScreen = document.getElementById('resultScreen');
        const gpaDisplay = document.getElementById('gpaDisplay');
        
        // Collapse form and show result
        calcScreen.classList.add('collapsed-form');
        setTimeout(() => {
            calcScreen.style.display = 'none';
            resultScreen.style.display = 'block';
            gpaDisplay.innerText = gpa.toFixed(2);
            
            // Trigger AI Analysis
            generateAIInsights(gpa, detailedScores);
        }, 800);
    }

    // --- AI LOGIC ---
    function generateAIInsights(gpa, data) {
        const aiText = document.getElementById('aiText');
        const aiDetails = document.getElementById('aiDetails');
        let analysisMsg = "";
        
        // 1. General Assessment
        if (gpa >= 9.0) {
            analysisMsg = "Outstanding performance! You are consistently hitting top marks. This GPA places you in the highest tier of students.";
            aiText.style.color = "#10b981"; // Green
        } else if (gpa >= 8.0) {
            analysisMsg = "Excellent work. You have a very strong grasp of the curriculum. With minor tweaks, you could hit the 9.0 range.";
            aiText.style.color = "#c4b5fd"; // Lavender
        } else if (gpa >= 7.0) {
            analysisMsg = "Good solid performance. You passed comfortably, but certain high-credit subjects dragged your average down.";
            aiText.style.color = "#f8fafc"; // White
        } else if (gpa >= 6.0) {
            analysisMsg = "You are in the safe zone, but your GPA is average. There is significant room for improvement in core technical subjects.";
            aiText.style.color = "#fbbf24"; // Yellow
        } else {
            analysisMsg = "Critical status. Your GPA is quite low. You need to focus heavily on retaking or improving scores in high-credit courses.";
            aiText.style.color = "#ef4444"; // Red
        }
        aiText.innerText = analysisMsg;

        // 2. Identify the "Culprit" (Highest Lost Potential)
        // Sort by lostPotential descending
        data.sort((a, b) => b.lostPotential - a.lostPotential);
        
        let culprit = data[0]; // The subject that hurt the GPA the most
        let savior = data.sort((a, b) => b.gradePoint - a.gradePoint)[0]; // Highest grade

        let detailsHTML = "";

        // Display the biggest drag on GPA
        if (culprit.gradePoint < 8) {
            detailsHTML += `
                <div class="culprit-row">
                    <div class="insight-icon">📉</div>
                    <div class="insight-detail">
                        <span class="insight-sub">Major Drag: ${culprit.name}</span>
                        <span class="insight-reason">
                            You scored only <b>${culprit.marks}/${MAX_MARKS}</b> in this <b>${culprit.credits}-credit</b> course.
                            Because it has high credits, this lowered your GPA significantly.
                        </span>
                    </div>
                </div>
            `;
        }

        // Display the best subject
        if (savior.gradePoint >= 8) {
            detailsHTML += `
                <div class="star-row">
                    <div class="insight-icon">🚀</div>
                    <div class="insight-detail">
                        <span class="insight-sub">Strongest Area: ${savior.name}</span>
                        <span class="insight-reason">
                            You nailed this with a <b>${savior.marks}/${MAX_MARKS}</b>! 
                            Keep using your study strategy from this subject for others.
                        </span>
                    </div>
                </div>
            `;
        }

        // 3. Improvement Suggestion
        if (gpa < 9.0 && culprit.gradePoint < 9) {
            detailsHTML += `
                <div style="margin-top:15px; font-size: 0.85rem; color:#94a3b8;">
                    <strong style="color:#c4b5fd">AI Tip:</strong> 
                    To increase your SGPA next time, prioritize studying 
                    <b>${culprit.name}</b> (or similar ${culprit.credits}-credit subjects). 
                    Improving a 4-credit subject by 1 grade point boosts your GPA twice as much as a 2-credit subject!
                </div>
            `;
        }

        aiDetails.innerHTML = detailsHTML;
    }