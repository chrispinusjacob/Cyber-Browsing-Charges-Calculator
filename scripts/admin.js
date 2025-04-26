document.addEventListener('DOMContentLoaded', () => {
    const rateInput = document.getElementById('rateInput');
    const saveRateBtn = document.getElementById('saveRate');
    const tableBody = document.querySelector('#receiptsTable tbody');
    const backHomeBtn = document.getElementById('backHome');

    // Load initial data
    rateInput.value = localStorage.getItem('browsingRate') || 2;
    loadReceipts();

    // Enable/Disable Save button based on input validity
    toggleSaveButton();
    rateInput.addEventListener('input', toggleSaveButton);

    saveRateBtn.addEventListener('click', () => {
        localStorage.setItem('browsingRate', rateInput.value);
        showAlert('Browsing rate updated successfully!', 'success');
    });

    backHomeBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    function loadReceipts() {
        const receipts = JSON.parse(localStorage.getItem('receipts')) || [];
        tableBody.innerHTML = '';

        receipts.forEach((receipt, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${receipt.receiptNumber}</td>
                <td>${receipt.date}</td>
                <td>${receipt.startTime}</td>
                <td>${receipt.endTime}</td>
                <td>${receipt.totalCost} bob</td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-info" data-index="${index}" data-action="view">View</button>
                        <button class="btn btn-sm btn-warning" data-index="${index}" data-action="edit">Edit</button>
                        <button class="btn btn-sm btn-danger" data-index="${index}" data-action="delete">Delete</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    tableBody.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        const index = button.getAttribute('data-index');
        const action = button.getAttribute('data-action');

        if (action === 'view') {
            showAlert(`Please open receipts/${index}.pdf manually.`, 'info');
        } else if (action === 'edit') {
            editReceipt(index);
        } else if (action === 'delete') {
            deleteReceipt(index);
        }
    });

    function deleteReceipt(index) {
        const receipts = JSON.parse(localStorage.getItem('receipts')) || [];
        const receipt = receipts[index];
        if (confirm(`Are you sure you want to delete receipt #${receipt.receiptNumber}?`)) {
            receipts.splice(index, 1);
            localStorage.setItem('receipts', JSON.stringify(receipts));
            loadReceipts();
            showAlert('Receipt deleted successfully.', 'warning');
        }
    }

    function editReceipt(index) {
        const receipts = JSON.parse(localStorage.getItem('receipts')) || [];
        const receipt = receipts[index];

        const newStart = prompt('Enter new Start Time (e.g., 09:00):', receipt.startTime);
        if (newStart === null) return; // Cancel pressed

        const newEnd = prompt('Enter new End Time (e.g., 11:00):', receipt.endTime);
        if (newEnd === null) return; // Cancel pressed

        if (!newStart.trim() || !newEnd.trim()) {
            showAlert('Both start and end times are required!', 'danger');
            return;
        }

        receipt.startTime = newStart;
        receipt.endTime = newEnd;
        localStorage.setItem('receipts', JSON.stringify(receipts));
        loadReceipts();
        showAlert('Receipt updated successfully!', 'success');
    }

    function showAlert(message, type = 'info') {
        // Remove any existing alert
        const existingAlert = document.querySelector('.alert.position-fixed');
        if (existingAlert) existingAlert.remove();

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alert.style.zIndex = 9999;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        document.body.appendChild(alert);

        setTimeout(() => {
            if (alert) {
                alert.classList.remove('show');
                alert.remove();
            }
        }, 3000);
    }

    function toggleSaveButton() {
        const value = rateInput.value;
        saveRateBtn.disabled = !(value && !isNaN(value) && Number(value) > 0);
    }
});
