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

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
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


if ($medicine->create($data)) {

    jsonResponse(true, "Medicine added successfully.");

}

jsonResponse(false, "Unable to add medicine.", null, 500);








