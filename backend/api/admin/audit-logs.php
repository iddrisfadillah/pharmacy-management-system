<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/response.php";

authorize(["admin"]);

$db = (new Database())->connect();

$logs = [];

/* User registrations */
$stmt = $db->query("
    SELECT
        id,
        full_name,
        email,
        created_at
    FROM users
    ORDER BY created_at DESC
");

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

    $logs[] = [
        "icon" => "fa-user-plus",
        "severity" => "info",
        "category" => "User",
        "event" => "New User Registered",
        "detail" => $row["full_name"] . " (" . $row["email"] . ") created an account",
        "user" => "System",
        "created_at" => $row["created_at"]
    ];
}

/* Pharmacy approvals */
$stmt = $db->query("
    SELECT
        pharmacy_name,
        created_at
    FROM pharmacies
    ORDER BY created_at DESC
");

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

    $logs[] = [
        "icon" => "fa-shop",
        "severity" => "success",
        "category" => "Vendor",
        "event" => "Pharmacy Registered",
        "detail" => $row["pharmacy_name"] . " joined the marketplace",
        "user" => "System",
        "created_at" => $row["created_at"]
    ];
}

/* Orders */
$stmt = $db->query("
    SELECT
        order_number,
        customer_name,
        order_status,
        created_at
    FROM orders
    ORDER BY created_at DESC
");

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

    $logs[] = [
        "icon" => "fa-bag-shopping",
        "severity" => $row["order_status"] == "Completed" ? "success" : "warning",
        "category" => "Order",
        "event" => "Order " . $row["order_status"],
        "detail" => $row["order_number"] . " for " . $row["customer_name"],
        "user" => "System",
        "created_at" => $row["created_at"]
    ];
}

/* Sort newest first */
usort($logs, function ($a, $b) {
    return strtotime($b["created_at"]) - strtotime($a["created_at"]);
});

jsonResponse(true, "Audit logs loaded", $logs);