<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/helpers.php";
require_once "../../utils/response.php";

require_once "../../models/Category.php";

authorize(["pharmacist"]);

$db = (new Database())->connect();

$category = new Category($db);

$pharmacy = getAuthenticatedPharmacy($db, $currentUser);

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    jsonResponse(false, "Invalid request.", null, 400);
}

if (empty($data["category_name"])) {
    jsonResponse(false, "Category name is required.", null, 400);
}

$success = $category->create(
    $pharmacy["id"],
    $data["category_name"],
    $data["description"] ?? null
);

if ($success) {
    jsonResponse(true, "Category created successfully.");
}

jsonResponse(false, "Unable to create category.", null, 500);