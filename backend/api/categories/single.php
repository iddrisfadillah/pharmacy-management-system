<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../models/Category.php";
require_once "../../models/Pharmacy.php";

authorize(["pharmacist"]);

$db = (new Database())->connect();

$category = new Category($db);
$pharmacyModel = new Pharmacy($db);

$data = json_decode(file_get_contents("php://input"), true);



if (!$pharmacy) {
    echo json_encode([
        "success" => false,
        "message" => "Pharmacy not found."
    ]);
    exit;
}

$id = $_GET["id"] ?? null;

if (!$id) {
    echo json_encode([
        "success" => false,
        "message" => "Category ID is required."
    ]);
    exit;
}

$result = $category->getById($id, $pharmacy["id"]);

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => "Category not found."
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "category" => $result
]);