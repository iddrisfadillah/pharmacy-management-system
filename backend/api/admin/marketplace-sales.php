<?php

header("Content-Type: application/json");

require_once "../../config/database.php";
require_once "../../middleware/auth.php";
require_once "../../utils/response.php";

authorize(["admin"]);

$db = (new Database())->connect();

$data = [];

/*
|--------------------------------------------------------------------------
| Total Revenue
|--------------------------------------------------------------------------
*/

$stmt = $db->query("
    SELECT IFNULL(SUM(total_amount),0) AS revenue
    FROM orders
    WHERE order_status='Completed'
");

$data["revenue"] = (float)$stmt->fetch(PDO::FETCH_ASSOC)["revenue"];

/*
|--------------------------------------------------------------------------
| Total Orders
|--------------------------------------------------------------------------
*/

$stmt = $db->query("
    SELECT COUNT(*) total
    FROM orders
");

$data["orders"] = (int)$stmt->fetch(PDO::FETCH_ASSOC)["total"];

/*
|--------------------------------------------------------------------------
| Completed Orders
|--------------------------------------------------------------------------
*/

$stmt = $db->query("
    SELECT COUNT(*) total
    FROM orders
    WHERE order_status='Completed'
");

$data["completed"] = (int)$stmt->fetch(PDO::FETCH_ASSOC)["total"];

/*
|--------------------------------------------------------------------------
| Pending Orders
|--------------------------------------------------------------------------
*/

$stmt = $db->query("
    SELECT COUNT(*) total
    FROM orders
    WHERE order_status='Pending'
");

$data["pending"] = (int)$stmt->fetch(PDO::FETCH_ASSOC)["total"];

/*
|--------------------------------------------------------------------------
| Recent Sales
|--------------------------------------------------------------------------
*/

$stmt = $db->query("
SELECT
    o.id,
    o.order_number,
    o.customer_name,
    o.total_amount,
    o.order_status,
    o.created_at,
    p.pharmacy_name
FROM orders o

LEFT JOIN pharmacies p
ON p.id=o.pharmacy_id

ORDER BY o.created_at DESC

LIMIT 10
");

$data["recent_sales"] = $stmt->fetchAll(PDO::FETCH_ASSOC);

jsonResponse(true,"Marketplace sales loaded",$data);