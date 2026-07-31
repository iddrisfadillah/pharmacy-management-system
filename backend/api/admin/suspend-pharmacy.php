<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/response.php";

authorize(["admin"]);

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data["id"])) {
    jsonResponse(false, "Pharmacy ID is required.", null, 400);
}

$db = (new Database())->connect();

$stmt = $db->prepare("
UPDATE pharmacies
SET status='suspended'
WHERE id=?
");

$stmt->execute([$data["id"]]);

jsonResponse(true, "Pharmacy suspended successfully.");