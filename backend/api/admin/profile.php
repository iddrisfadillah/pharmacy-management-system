<?php
require_once "../../config/database.php";
require_once "../../middleware/auth.php";

header("Content-Type: application/json");

global $currentUser;
$user = $currentUser;

$db = (new Database())->connect();

$stmt = $db->prepare("
SELECT
    id,
    full_name,
    email,
    phone,
    role,
    status,
    avatar,
    created_at
FROM users
WHERE id = ?
LIMIT 1
");

$stmt->execute([$user["id"]]);

echo json_encode([
    "success" => true,
    "data" => $stmt->fetch(PDO::FETCH_ASSOC)
]);