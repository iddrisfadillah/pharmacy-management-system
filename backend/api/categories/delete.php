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

if (!$data || empty($data["id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Category ID is required."
    ]);
    exit;
}

$userId = $currentUser["id"];

$pharmacy = $pharmacyModel->getByUserId($userId);

if (!$pharmacy) {
    echo json_encode([
        "success" => false,
        "message" => "Pharmacy not found."
    ]);
    exit;
}

$existing = $category->getById($data["id"], $pharmacy["id"]);

if (!$existing) {
    echo json_encode([
        "success" => false,
        "message" => "Category not found."
    ]);
    exit;
}

$success = $category->delete(
    $data["id"],
    $pharmacy["id"]
);

echo json_encode([
    "success" => $success,
    "message" => $success
        ? "Category deleted successfully."
        : "Unable to delete category."
]);