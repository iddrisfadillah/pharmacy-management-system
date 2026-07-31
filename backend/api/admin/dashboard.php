<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/response.php";

authorize(["admin"]);

$db = (new Database())->connect();

$stats = [];

/* Total Pharmacies */
$stmt = $db->query("
SELECT COUNT(*) total
FROM pharmacies
");

$stats["pharmacies"] = (int)$stmt->fetch(PDO::FETCH_ASSOC)["total"];

/* Active Pharmacies */

$stmt = $db->query("
SELECT COUNT(*) total
FROM pharmacies
WHERE status='approved'
");

$stats["active_pharmacies"] = (int)$stmt->fetch(PDO::FETCH_ASSOC)["total"];

/* Customers */

$stmt = $db->query("
SELECT COUNT(*) total
FROM users
WHERE role='customer'
");

$stats["customers"] = (int)$stmt->fetch(PDO::FETCH_ASSOC)["total"];

/* Pharmacists */

$stmt = $db->query("
SELECT COUNT(*) total
FROM users
WHERE role='pharmacist'
");

$stats["pharmacists"] = (int)$stmt->fetch(PDO::FETCH_ASSOC)["total"];

/* Medicines */

$stmt = $db->query("
SELECT COUNT(*) total
FROM medicines
");

$stats["medicines"] = (int)$stmt->fetch(PDO::FETCH_ASSOC)["total"];

/* Orders */

$stmt = $db->query("
SELECT COUNT(*) total
FROM orders
");

$stats["orders"] = (int)$stmt->fetch(PDO::FETCH_ASSOC)["total"];

/* Revenue */

$stmt = $db->query("
SELECT IFNULL(SUM(total_amount),0) total
FROM orders
WHERE payment_status='Paid'
");

$stats["revenue"] = (float)$stmt->fetch(PDO::FETCH_ASSOC)["total"];

/* Pending Pharmacies */

$stmt = $db->query("
SELECT COUNT(*) total
FROM pharmacies
WHERE status='pending'
");

$stats["pending"] = (int)$stmt->fetch(PDO::FETCH_ASSOC)["total"];

jsonResponse(true,"Dashboard loaded",$stats);