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

$db->beginTransaction();

try {

    $stmt = $db->prepare("
    SELECT user_id
    FROM pharmacies
    WHERE id=?
    ");

    $stmt->execute([$data["id"]]);

    $pharmacy = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pharmacy) {
        throw new Exception("Pharmacy not found.");
    }

    $stmt = $db->prepare("
    DELETE FROM pharmacies
    WHERE id=?
    ");

    $stmt->execute([$data["id"]]);

    $stmt = $db->prepare("
    DELETE FROM users
    WHERE id=?
    ");

    $stmt->execute([$pharmacy["user_id"]]);

    $db->commit();

    jsonResponse(true, "Pharmacy deleted successfully.");

} catch (Exception $e) {

    $db->rollBack();

    jsonResponse(false, $e->getMessage(), null, 500);

}