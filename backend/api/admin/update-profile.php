<?php

require_once "../../config/database.php";
require_once "../../middleware/auth.php";

header("Content-Type: application/json");

global $currentUser;
$user = $currentUser;

$data = json_decode(file_get_contents("php://input"), true);

$full_name = trim(($data["first_name"] ?? "") . " " . ($data["last_name"] ?? ""));
$email = trim($data["email"] ?? "");
$phone = trim($data["phone"] ?? "");

$db = (new Database())->connect();

/* Check what is currently in the database */
$check = $db->prepare("SELECT * FROM users WHERE id = ?");
$check->execute([$user["id"]]);
$before = $check->fetch(PDO::FETCH_ASSOC);

/* Update */
$stmt = $db->prepare("
UPDATE users
SET
    full_name = ?,
    email = ?,
    phone = ?
WHERE id = ?
");

$stmt->execute([
    $full_name,
    $email,
    $phone,
    $user["id"]
]);

/* Read it again */
$check->execute([$user["id"]]);
$after = $check->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "before" => $before,
    "after" => $after,
    "rows_updated" => $stmt->rowCount()
]);