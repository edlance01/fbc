document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Dynamic Member Entry Addition ---
    const memberGrid = document.getElementById('member-grid');
    const addMemberBtn = document.getElementById('add-member-btn');

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

    // --- 2. Create Page for Next Week Functionality ---
    const createPageBtn = document.getElementById('create-next-page-btn');

    function getFormattedDateString(dateObj) {
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const yy = String(dateObj.getFullYear()).slice(-2);
        return `${mm}${dd}${yy}`;
    }

    if (createPageBtn) {
        createPageBtn.addEventListener('click', () => {
            // Default date = Current Date + 7 days
            const nextWeekDate = new Date();
            nextWeekDate.setDate(nextWeekDate.getDate() + 7);
            const defaultMMDDYY = getFormattedDateString(nextWeekDate);

            // Prompt user for date with default value
            const userInput = prompt("Enter the date for next week's meeting (MMDDYY format):", defaultMMDDYY);

            if (userInput === null) return; // Cancelled

            const formattedDate = userInput.trim();

            if (!/^\d{6}$/.test(formattedDate)) {
                alert("Invalid format! Please enter 6 digits in MMDDYY format (e.g., 082626).");
                return;
            }

            const filename = `notes_${formattedDate}.html`;

            // Check if file already exists in localStorage
            if (localStorage.getItem(filename)) {
                const overwrite = confirm(`A saved record for '${filename}' already exists. Do you want to overwrite it?`);
                if (!overwrite) {
                    return;
                }
            }

            // Capture current page HTML DOM
            const currentHTML = document.documentElement.outerHTML;
            localStorage.setItem(filename, currentHTML);

            // Download file locally
            const blob = new Blob([currentHTML], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert(`Successfully created '${filename}'!`);
        });
    }
});