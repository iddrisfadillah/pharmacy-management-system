<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/response.php";

authorize(["admin"]);

$db = (new Database())->connect();

$sql = "
SELECT
    p.id,
    p.pharmacy_name,
    p.pharmacy_address,
    p.license_number,
    p.business_registration,
    p.logo,
    p.status,

    u.full_name,
    u.email,
    u.phone,
    u.created_at

FROM pharmacies p

INNER JOIN users u
ON p.user_id = u.id

ORDER BY u.created_at DESC
";

$stmt = $db->query($sql);

jsonResponse(
    true,
    "Pharmacies loaded",
    $stmt->fetchAll(PDO::FETCH_ASSOC)
);