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

$medicines = $medicine->getAll($pharmacy["id"]);

jsonResponse(true, "Medicines retrieved successfully.", [
    "medicines" => $medicines
]);