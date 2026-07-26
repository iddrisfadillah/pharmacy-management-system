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

if ($medicine->delete($data["id"], $pharmacy["id"])) {
    jsonResponse(true, "Medicine deleted successfully.");
}

jsonResponse(false, "Unable to delete medicine.", null, 500);