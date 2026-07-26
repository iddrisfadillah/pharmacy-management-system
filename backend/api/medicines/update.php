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

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || empty($data["id"])) {
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

if ($medicine->update($data)) {
    jsonResponse(true, "Medicine updated successfully.");
}

jsonResponse(false, "Unable to update medicine.", null, 500);