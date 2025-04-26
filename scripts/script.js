document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const container = document.querySelector('.container');
    const form = document.getElementById('calculatorForm');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const liveCharge = document.getElementById('liveCharge');
    const generateReceiptBtn = document.getElementById('generateReceiptBtn');
    const adminLink = document.getElementById('adminLink');
    let calculatedReceiptData = null;
  
    // Hide loader after 1 second
    setTimeout(() => {
      loader.style.display = 'none';
      container.style.display = 'block';
    }, 1000);
  
    adminLink.addEventListener('click', () => {
      window.location.href = 'admin.html';
    });
  
    function calculateCharges() {
      const startTime = startTimeInput.value;
      const endTime = endTimeInput.value;
      if (!startTime || !endTime) {
        liveCharge.innerHTML = `Total Charges: <strong>0 bob</strong>`;
        generateReceiptBtn.disabled = true;
        return;
      }
  
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
  
      const diff = (end - start) / (1000 * 60); // in minutes
  
      if (diff <= 0) {
        liveCharge.innerHTML = `<strong class="text-danger">Invalid time range!</strong>`;
        generateReceiptBtn.disabled = true;
        calculatedReceiptData = null;
        return;
      }
  
      const browsingRate = localStorage.getItem('browsingRate') || 2;
      const totalCost = diff * browsingRate;
  
      liveCharge.innerHTML = `Total Charges: <strong>${totalCost} bob</strong>`;
      generateReceiptBtn.disabled = false;
  
      calculatedReceiptData = {
        receiptNumber: `copylink${String(getNextReceiptNo()).padStart(3, '0')}`,
        date: new Date().toLocaleDateString(),
        startTime,
        endTime,
        browsingRate,
        totalCost
      };
    }
  
    startTimeInput.addEventListener('input', calculateCharges);
    endTimeInput.addEventListener('input', calculateCharges);
  
    generateReceiptBtn.addEventListener('click', () => {
      if (!calculatedReceiptData) {
        showAlert('Please select valid start and end times first.', 'danger');
        return;
      }
  
      generateReceiptBtn.disabled = true;
      generateReceiptBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Generating Receipt...
      `;
  
      // Remove old download button if it exists
      const oldDownloadBtn = document.getElementById('downloadReceiptBtn');
      if (oldDownloadBtn) oldDownloadBtn.remove();
  
      setTimeout(() => {
        const fileName = generatePDF(calculatedReceiptData);
  
        // Create and insert download button right after the generate button
        const downloadBtn = document.createElement('a');
        downloadBtn.href = '#';
        downloadBtn.className = 'btn btn-success mt-3 w-100';
        downloadBtn.id = 'downloadReceiptBtn';
        downloadBtn.textContent = 'Download Receipt';
        downloadBtn.onclick = () => downloadPDF(fileName);
  
        generateReceiptBtn.insertAdjacentElement('afterend', downloadBtn);
  
        generateReceiptBtn.innerHTML = 'Generate Receipt';
        generateReceiptBtn.disabled = false;
      }, 2000);
    });
  
    function getNextReceiptNo() {
      let lastNo = localStorage.getItem('lastReceiptNo') || 1;
      localStorage.setItem('lastReceiptNo', Number(lastNo) + 1);
      return lastNo;
    }
  
    function saveReceiptToLocalStorage(receiptData) {
      let receipts = JSON.parse(localStorage.getItem('receipts')) || [];
      receipts.push(receiptData);
      localStorage.setItem('receipts', JSON.stringify(receipts));
    }
  
    function generatePDF(receiptData) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
      
        // Logo (centered at the top)
        const logoUrl = 'logo.png'; // Replace with your logo path
        const logoWidth = 30; // Adjust based on your logo size
        const logoHeight = 30; // Adjust based on your logo size
        const pageWidth = doc.internal.pageSize.width;
        const logoX = (pageWidth - logoWidth) / 2; // Centering the logo
      
        // Add logo at the top-center
        doc.addImage(logoUrl, 'PNG', logoX, 10, logoWidth, logoHeight);
      
        // Set title with increased space for better layout
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('Copylink Cyber Café', pageWidth / 2, 40, { align: 'center' });
      
        // Horizontal line below title
        doc.setLineWidth(0.5);
        doc.line(10, 45, pageWidth - 10, 45);
      
        // Receipt details section (increased space to avoid overlap with logo)
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(12);
      
        // Start at a higher y-coordinate (adjusted to avoid logo overlap)
        let currentY = 55;
      
        // Positioning the text fields with proper spacing
        doc.text(`Receipt #: ${receiptData.receiptNumber}`, 20, currentY);
        currentY += 10;
        doc.text(`Date: ${receiptData.date}`, 20, currentY);
        currentY += 10;
        doc.text(`Start Time: ${receiptData.startTime}`, 20, currentY);
        currentY += 10;
        doc.text(`End Time: ${receiptData.endTime}`, 20, currentY);
        currentY += 10;
        doc.text(`Browsing Rate: ${receiptData.browsingRate} bob/min`, 20, currentY);
        currentY += 10;
        doc.text(`Total Cost: ${receiptData.totalCost} bob`, 20, currentY);
      
        // Line separator
        currentY += 15;
        doc.setLineWidth(0.5);
        doc.line(10, currentY, pageWidth - 10, currentY);
      
        // Thank you message
        currentY += 10;
        doc.setFont('Helvetica', 'italic');
        doc.setFontSize(12);
        doc.text('Thanks for your business!', 20, currentY);
      
        // Footer section: signature and stamp placeholders
        currentY += 20;
        doc.setFont('Helvetica', 'normal');
        doc.text('______________________________', 20, currentY);
        currentY += 5;
        doc.text("Cyber Cafe Attendant's Signature", 20, currentY);
        currentY += 15;
        doc.text('______________________________', 20, currentY);
        currentY += 5;
        doc.text('Stamp', 20, currentY);
      
        // Save the receipt to a file and return the filename
        const fileName = `${receiptData.receiptNumber}.pdf`;
        doc.save(fileName);
      
        // Save receipt to local storage (optional)
        saveReceiptToLocalStorage(receiptData);
      
        return fileName;
      }
  
    function downloadPDF(fileName) {
      // You can add additional handling if needed
      showAlert('Receipt was already downloaded when generated.', 'info');
    }
  
    function showAlert(message, type = 'info') {
      const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
      document.getElementById('alertMessage').textContent = message;
      alertModal.show();
    }
  });
  