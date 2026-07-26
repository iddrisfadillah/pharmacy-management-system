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

$id = $_GET["id"] ?? null;

if (!$id) {
    jsonResponse(false, "Medicine ID is required.", null, 400);
}

$result = $medicine->getById($id, $pharmacy["id"]);

if (!$result) {
    jsonResponse(false, "Medicine not found.", null, 404);
}

jsonResponse(true, "Medicine retrieved successfully.", [
    "medicine" => $result
]);