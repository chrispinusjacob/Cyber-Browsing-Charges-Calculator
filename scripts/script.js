document.addEventListener('DOMContentLoaded', function () {
    const calculatorForm = document.getElementById('calculatorForm');
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popupMessage');
    const waitPopup = document.getElementById('waitPopup');
    const viewReceiptsButton = document.getElementById('viewReceiptsButton');

    let receiptCount = 1;

    calculatorForm.addEventListener('submit', function (event) {
        event.preventDefault();

        let startTime = document.getElementById('startTime').value;
        let endTime = document.getElementById('endTime').value;

        if (startTime && endTime) {
            calculateCharges(startTime, endTime);
        } else {
            showMessage('Please enter both start and end times.');
        }
    });

    viewReceiptsButton.addEventListener('click', function () {
        viewAllReceipts();
    });

    function calculateCharges(startTime, endTime) {
        const browsingCostPerMinute = 2;
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        const minutes = Math.floor((end - start) / 60000);
        const totalCost = minutes * browsingCostPerMinute;

        showPopup(`Browsing Charges: ${totalCost} bob`);

        setTimeout(() => {
            generateReceipt(startTime, endTime, browsingCostPerMinute, totalCost);
            saveReceiptToExcel(startTime, endTime, browsingCostPerMinute, totalCost);
            showWaitPopup();
        }, 3000); // Show popup for 3 seconds
    }

    function showPopup(message) {
        popupMessage.textContent = message;
        popup.classList.add('active');

        setTimeout(() => {
            popup.classList.remove('active');
        }, 3000); // Show popup for 3 seconds
    }

    function showWaitPopup() {
        waitPopup.classList.add('active');

        setTimeout(() => {
            waitPopup.classList.remove('active');
        }, 3000); // Show wait popup for 3 seconds
    }

    function generateReceipt(startTime, endTime, browsingRate, browsingCost) {
        const receiptNumber = `copylink${String(receiptCount).padStart(3, '0')}`;
        const currentDate = new Date();
        const receiptContent = `
            <div style="text-align: center;">
                <img src="path_to_logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 10px;">
                <p>Copy Link</p>
                <p>Nairobi, Kenya</p>
                <p>Telephone: +254 738 505 187</p>
                <p>Emails: info@copylink.co.ke, copylink4@gmail.com</p>
                <p>${currentDate.toLocaleString()}</p>
            </div>
            <p>Receipt Number: ${receiptNumber}</p>
            <p>Start Time: ${startTime}</p>
            <p>End Time: ${endTime}</p>
            <p>Browsing Rate: ${browsingRate} bob per minute</p>
            <p>Browsing Cost: ${browsingCost} bob</p>
            <p style="margin-top: 20px;">Thanks for your business!</p>
            <p style="margin-top: 20px;">______________________________</p>
            <p>Cyber Cafe Attendant's Signature</p>
            <p style="margin-top: 20px;">______________________________</p>
            <p>Stamp</p>
        `;

        const newWindow = window.open('', '', 'width=400,height=600');
        newWindow.document.write('<html><head><title>Receipt</title></head><body>');
        newWindow.document.write(receiptContent);
        newWindow.document.write('</body></html>');
        newWindow.document.close();
        newWindow.print();

        receiptCount++;
    }

    function saveReceiptToExcel(startTime, endTime, browsingRate, browsingCost) {
        const receiptData = [
            ['Start Time', 'End Time', 'Browsing Rate', 'Browsing Cost'],
            [startTime, endTime, `${browsingRate} bob per minute`, `${browsingCost} bob`]
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(receiptData);
        XLSX.utils.book_append_sheet(wb, ws, 'Receipt');

        const currentDate = new Date().toISOString().slice(0, 10);
        const fileName = `receipt_${currentDate}_${String(receiptCount).padStart(3, '0')}.xlsx`;
        XLSX.writeFile(wb, `receipts/${fileName}`);
    }

    function viewAllReceipts() {
        window.open('receipts/', '_blank');
    }

    // Hide loader and show calculator container
    document.querySelector('.loader').style.display = 'none';
    document.querySelector('.calculator-container').style.display = 'block';
});
