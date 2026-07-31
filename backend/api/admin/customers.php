<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/response.php";

authorize(["admin"]);

$db = (new Database())->connect();

$sql = "
SELECT
    id,
    full_name,
    email,
    phone,
    role,
    status,
    created_at
FROM users
WHERE role = 'customer'
ORDER BY created_at DESC
";

$stmt = $db->query($sql);

jsonResponse(
    true,
    "Customers loaded",
    $stmt->fetchAll(PDO::FETCH_ASSOC)
);