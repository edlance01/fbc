document.addEventListener('DOMContentLoaded', () => {
    const memberGrid = document.getElementById('member-grid');
    const addMemberBtn = document.getElementById('add-member-btn');
    const createPageBtn = document.getElementById('create-next-page-btn');
    const saveNotesBtn = document.getElementById('save-notes-btn');

    // --- 1. Dynamic Member Row Addition ---
    if (addMemberBtn && memberGrid) {
        addMemberBtn.addEventListener('click', () => {
            const newRow = document.createElement('div');
            newRow.className = 'member-row';
            newRow.innerHTML = `
        <div class="member-name-group">
          <label>Member Name:</label>
          <input type="text" placeholder="Enter member name..." class="member-input">
        </div>
        <div class="insight-group">
          <div class="insight-box resonated">
            <label>Clicked / Resonated</label>
            <textarea rows="3" placeholder="What quote or concept clicked?"></textarea>
          </div>
          <div class="insight-box confusing">
            <label>Confusing / Debatable</label>
            <textarea rows="3" placeholder="What was confusing or debatable?"></textarea>
          </div>
        </div>
      `;
            memberGrid.appendChild(newRow);
        });
    }

    // --- 2. Helper: Sync Form Input Values to DOM Attributes ---
    // Ensures typed text inside <input> and <textarea> gets saved into HTML string
    function syncFormStateToDOM() {
        document.querySelectorAll('input').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                if (input.checked) {
                    input.setAttribute('checked', 'checked');
                } else {
                    input.removeAttribute('checked');
                }
            } else {
                input.setAttribute('value', input.value);
            }
        });

        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.textContent = textarea.value;
        });
    }

    // --- 3. Helper: Generate & Download HTML File ---
    function downloadHTMLFile(filename) {
        syncFormStateToDOM();
        const currentHTML = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

        // Save backup to LocalStorage
        localStorage.setItem(filename, currentHTML);

        // Download blob file
        const blob = new Blob([currentHTML], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- 4. Date Formatting Utility (MMDDYY) ---
    function getFormattedDateString(dateObj) {
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const yy = String(dateObj.getFullYear()).slice(-2);
        return `${mm}${dd}${yy}`;
    }

    // --- 5. Save Current Notes Button ---
    if (saveNotesBtn) {
        saveNotesBtn.addEventListener('click', () => {
            const dateInput = document.getElementById('meeting-date');
            let filename = 'book_club_notes.html';

            if (dateInput && dateInput.value) {
                const parts = dateInput.value.split('-'); // YYYY-MM-DD
                if (parts.length === 3) {
                    filename = `notes_${parts[1]}${parts[2]}${parts[0].slice(-2)}.html`;
                }
            }

            if (localStorage.getItem(filename)) {
                const overwrite = confirm(`A saved file '${filename}' already exists. Overwrite?`);
                if (!overwrite) return;
            }

            downloadHTMLFile(filename);
            alert(`Current meeting notes saved as '${filename}'!`);
        });
    }

    // --- 6. Create Page for Next Week Button ---
    if (createPageBtn) {
        createPageBtn.addEventListener('click', () => {
            const nextWeekDate = new Date();
            nextWeekDate.setDate(nextWeekDate.getDate() + 7);
            const defaultMMDDYY = getFormattedDateString(nextWeekDate);

            const userInput = prompt("Enter the date for next week's meeting (MMDDYY format):", defaultMMDDYY);
            if (userInput === null) return;

            const formattedDate = userInput.trim();
            if (!/^\d{6}$/.test(formattedDate)) {
                alert("Invalid format! Please enter 6 digits in MMDDYY format (e.g., 082626).");
                return;
            }

            const filename = `notes_${formattedDate}.html`;

            if (localStorage.getItem(filename)) {
                const overwrite = confirm(`A saved page for '${filename}' already exists. Overwrite?`);
                if (!overwrite) return;
            }

            downloadHTMLFile(filename);
            alert(`Next week's template saved as '${filename}'!`);
        });
    }
});