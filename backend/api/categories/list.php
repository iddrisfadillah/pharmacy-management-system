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

// Get the logged-in pharmacist's pharmacy
$pharmacy = getAuthenticatedPharmacy($db, $currentUser);

if (!$pharmacy) {
    jsonResponse(false, "Pharmacy not found.", null, 404);
}

// Get categories
$categories = $category->getAll($pharmacy["id"]);

jsonResponse(true, "Categories retrieved successfully.", [
    "categories" => $categories
]);