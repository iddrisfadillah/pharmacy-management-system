<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../models/Medicine.php";

authorize(["pharmacist"]);

$db = (new Database())->connect();
$medicine = new Medicine($db);

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request."
    ]);
    exit;
}

$required = [
    "category_id",
    "medicine_name",
    "purchase_price",
    "selling_price",
    "stock_quantity"
];

foreach ($required as $field) {

    if (!isset($data[$field]) || trim((string)$data[$field]) === "") {

        echo json_encode([
            "success" => false,
            "message" => "$field is required."
        ]);

        exit;
    }

$userId = $currentUser["id"];

$pharmacy = $medicine->getPharmacyByUser($userId);

if (!$pharmacy) {

    echo json_encode([
        "success" => false,
        "message" => "Pharmacy not found."
    ]);

    exit;
}

$pharmacyId = $pharmacy["id"];
if (!$medicine->categoryExists($data["category_id"], $pharmacyId)) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid category."
    ]);

    exit;
}
$success = $medicine->create(

    $pharmacyId,
    $data["category_id"],

    $data["medicine_name"],
    $data["generic_name"] ?? null,
    $data["brand"] ?? null,

    $data["dosage"] ?? null,
    $data["form"] ?? null,
    $data["strength"] ?? null,

    $data["batch_number"] ?? null,
    $data["manufacturer"] ?? null,

    $data["expiry_date"] ?? null,

    $data["purchase_price"],
    $data["selling_price"],

    $data["stock_quantity"],
    $data["minimum_stock"] ?? 10,

    $data["description"] ?? null,
    $data["image"] ?? null

);
if ($success) {

    echo json_encode([
        "success" => true,
        "message" => "Medicine added successfully."
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Unable to add medicine."
    ]);

}


    
    
}