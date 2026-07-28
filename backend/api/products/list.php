<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/response.php";

authorize(["customer"]);

$db = (new Database())->connect();

$sql = "
SELECT
    m.id,
    m.medicine_name,
    m.description,
    m.selling_price,
    m.stock_quantity,
    m.image,
    m.status,
    c.category_name,
    p.pharmacy_name
FROM medicines m
JOIN pharmacies p
    ON p.id = m.pharmacy_id
LEFT JOIN categories c
    ON c.id = m.category_id
WHERE
    m.status='Available'
AND
    m.stock_quantity > 0
ORDER BY
    m.created_at DESC
";

$stmt = $db->prepare($sql);
$stmt->execute();

$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

jsonResponse(
    true,
    "Products retrieved successfully.",
    [
        "products"=>$products
    ]
);