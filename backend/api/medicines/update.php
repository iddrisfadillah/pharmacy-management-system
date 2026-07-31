<?php

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
unset($data["_method"]);

if (empty($data["id"])) {
    jsonResponse(false, "Medicine ID is required.", null, 400);
}

$existing = $medicine->getById($data["id"], $pharmacy["id"]);

if (!$existing) {
    jsonResponse(false, "Medicine not found.", null, 404);
}

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
    "image" => null,
    "status" => "available"
];

// Keep the existing image by default
$data["image"] = $existing["image"];

// Upload new image if one was selected
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

    $filename = uniqid("medicine_", true) . "." . $extension;

    if (
        move_uploaded_file(
            $_FILES["image"]["tmp_name"],
            $uploadDir . $filename
        )
    ) {

        // Optional: delete the old image
        if (
            !empty($existing["image"]) &&
            file_exists($uploadDir . $existing["image"])
        ) {
            unlink($uploadDir . $existing["image"]);
        }

        $data["image"] = $filename;

    } else {

        jsonResponse(false, "Failed to upload image.", null, 500);

    }
}

if ($medicine->update($data)) {
    jsonResponse(true, "Medicine updated successfully.");
}

jsonResponse(false, "Unable to update medicine.", null, 500);