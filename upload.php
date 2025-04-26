<?php
// Create receipts folder if it doesn't exist
$targetDir = "receipts/";
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if (isset($_FILES['file'])) {
    $filename = basename($_FILES["file"]["name"]);
    $targetFile = $targetDir . $filename;

    if (move_uploaded_file($_FILES["file"]["tmp_name"], $targetFile)) {
        echo "Upload success!";
    } else {
        echo "Upload failed!";
    }
} else {
    echo "No file received.";
}
?>
