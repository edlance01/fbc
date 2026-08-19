document.addEventListener('DOMContentLoaded', () => {
    const memberGrid = document.getElementById('member-grid');
    const addMemberBtn = document.getElementById('add-member-btn');
    const createPageBtn = document.getElementById('create-next-page-btn');
    const saveNotesBtn = document.getElementById('save-notes-btn');

    const STORAGE_KEY = 'book_club_current_session';

    // --- 1. Helper: Helper to Create Member Entry with Toolbars ---
    function createMemberRow(name = '', resonated = '', confusing = '') {
        const row = document.createElement('div');
        row.className = 'member-row';
        row.innerHTML = `
      <div class="member-header-bar">
        <div class="member-name-group">
          <label>Member Name:</label>
          <input type="text" placeholder="Enter member name..." class="member-input" value="${name}">
        </div>
        <div class="member-controls">
          <button type="button" class="icon-btn edit-btn" title="Clear/Reset Box">✏️</button>
          <button type="button" class="icon-btn delete-btn" title="Delete Member">🗑️</button>
        </div>
      </div>
      <div class="insight-group">
        <div class="insight-box resonated">
          <label>Clicked / Resonated</label>
          <textarea rows="3" placeholder="What quote or concept clicked?">${resonated}</textarea>
        </div>
        <div class="insight-box confusing">
          <label>Confusing / Debatable</label>
          <textarea rows="3" placeholder="What was confusing or debatable?">${confusing}</textarea>
        </div>
      </div>
    `;

        // Inline Toolbar Controls
        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => {
            if (confirm('Clear text inside this member block?')) {
                row.querySelectorAll('input, textarea').forEach(el => el.value = '');
                saveStateToLocalStorage();
            }
        });

        deleteBtn.addEventListener('click', () => {
            if (memberGrid.children.length <= 1) {
                alert('You must keep at least one member row.');
                return;
            }
            if (confirm('Delete this member block?')) {
                row.remove();
                saveStateToLocalStorage();
            }
        });

        return row;
    }

    // --- 2. Add Member Button ---
    if (addMemberBtn && memberGrid) {
        addMemberBtn.addEventListener('click', () => {
            const newRow = createMemberRow();
            memberGrid.appendChild(newRow);
            saveStateToLocalStorage();
        });
    }

    // --- 3. Sync Form Data & Auto-Save to LocalStorage ---
    function saveStateToLocalStorage() {
        syncFormStateToDOM();
        localStorage.setItem(STORAGE_KEY, document.documentElement.outerHTML);
    }

    function syncFormStateToDOM() {
        document.querySelectorAll('input').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                if (input.checked) input.setAttribute('checked', 'checked');
                else input.removeAttribute('checked');
            } else {
                input.setAttribute('value', input.value);
            }
        });

        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.textContent = textarea.value;
        });
    }

    // Auto-save on any keypress or input change
    document.addEventListener('input', () => {
        saveStateToLocalStorage();
    });

    // --- 4. Load Saved Notes on Refresh ---
    function loadFromLocalStorage() {
        const savedHTML = localStorage.getItem(STORAGE_KEY);
        if (savedHTML) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(savedHTML, 'text/html');

            const savedGrid = doc.getElementById('member-grid');
            if (savedGrid && memberGrid) {
                memberGrid.innerHTML = '';
                savedGrid.querySelectorAll('.member-row').forEach(row => {
                    const name = row.querySelector('.member-input')?.value || '';
                    const resonated = row.querySelector('.resonated textarea')?.value || '';
                    const confusing = row.querySelector('.confusing textarea')?.value || '';
                    memberGrid.appendChild(createMemberRow(name, resonated, confusing));
                });
            }

            // Restore other form values across the page
            doc.querySelectorAll('input[id], textarea[id]').forEach(savedEl => {
                const currentEl = document.getElementById(savedEl.id);
                if (currentEl) currentEl.value = savedEl.value;
            });
        } else {
            // Initialize 1 default row if empty
            if (memberGrid && memberGrid.children.length === 0) {
                memberGrid.appendChild(createMemberRow());
            }
        }
    }

    loadFromLocalStorage();

    // --- 5. Download HTML File ---
    function downloadHTMLFile(filename) {
        syncFormStateToDOM();
        const currentHTML = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

        const blob = new Blob([currentHTML], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- 6. Save Notes Button ---
    if (saveNotesBtn) {
        saveNotesBtn.addEventListener('click', () => {
            const dateInput = document.getElementById('meeting-date');
            let filename = 'book_club_notes.html';

            if (dateInput && dateInput.value) {
                const parts = dateInput.value.split('-');
                if (parts.length === 3) {
                    filename = `notes_${parts[1]}${parts[2]}${parts[0].slice(-2)}.html`;
                }
            }

            downloadHTMLFile(filename);
            alert(`Current meeting notes exported as '${filename}'!`);
        });
    }

    // --- 7. Create Next Week's Template Button ---
    if (createPageBtn) {
        createPageBtn.addEventListener('click', () => {
            const nextWeekDate = new Date();
            nextWeekDate.setDate(nextWeekDate.getDate() + 7);

            const mm = String(nextWeekDate.getMonth() + 1).padStart(2, '0');
            const dd = String(nextWeekDate.getDate()).padStart(2, '0');
            const yy = String(nextWeekDate.getFullYear()).slice(-2);
            const defaultMMDDYY = `${mm}${dd}${yy}`;

            const userInput = prompt("Enter the date for next week's meeting (MMDDYY format):", defaultMMDDYY);
            if (userInput === null) return;

            const formattedDate = userInput.trim();
            if (!/^\d{6}$/.test(formattedDate)) {
                alert("Invalid format! Please enter 6 digits in MMDDYY format (e.g., 082626).");
                return;
            }

            downloadHTMLFile(`notes_${formattedDate}.html`);
        });
    }
});