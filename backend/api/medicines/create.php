<?php


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/helpers.php";
require_once "../../utils/response.php";

require_once "../../models/Medicine.php";

authorize(["pharmacist"]);

$db = (new Database())->connect();

$medicine = new Medicine($db);

$pharmacy = getAuthenticatedPharmacy($db, $currentUser);
$data = $_POST;

if (empty($data)) {
    jsonResponse(false, "Invalid request.", null, 400);
}
$required = [
    "category_id",
    "medicine_name",
    "purchase_price",
    "selling_price",
    "stock_quantity"
];

foreach ($required as $field) {

    if (
        !isset($data[$field]) ||
        trim((string)$data[$field]) === ""
    ) {

        jsonResponse(false, "$field is required.", null, 400);
    }
}

// verify ownership
if (
    !$medicine->categoryBelongsToPharmacy(
        $data["category_id"],
        $pharmacy["id"]
    )
) {

    jsonResponse(false, "Invalid category.", null, 400);
}

$data["pharmacy_id"] = $pharmacy["id"];

$data += [
    "generic_name" => null,
    "brand" => null,
    "dosage" => null,
    "form" => null,
    "strength" => null,
    "batch_number" => null,
    "manufacturer" => null,
    "expiry_date" => null,
    "minimum_stock" => 10,
    "description" => null,
    "image" => null
];
// Upload medicine image
if (isset($_FILES["image"]) && $_FILES["image"]["error"] === UPLOAD_ERR_OK) {

    $uploadDir = "../../../uploads/medicines/";

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $extension = strtolower(
        pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION)
    );

    $allowed = ["jpg", "jpeg", "png", "webp"];

    if (!in_array($extension, $allowed)) {
        jsonResponse(false, "Only JPG, PNG and WEBP images are allowed.", null, 400);
    }

    $filename =
        uniqid("medicine_", true) .
        "." .
        $extension;

    if (
        move_uploaded_file(
            $_FILES["image"]["tmp_name"],
            $uploadDir . $filename
        )
    ) {

        $data["image"] = $filename;

    } else {

        jsonResponse(false, "Failed to upload image.", null, 500);

    }

}

if ($medicine->create($data)) {

    jsonResponse(true, "Medicine added successfully.");

}

jsonResponse(false, "Unable to add medicine.", null, 500);








