<?php

require_once __DIR__ . "/../../middleware/auth.php";


authorize(["admin"]);

$type = $_GET["type"] ?? "";

switch ($type) {

    case "sales":
        require_once __DIR__ . "/../../reports/sales-report.php";
        break;

    case "users":
        require_once __DIR__ . "/../../reports/users-report.php";
        break;

    case "pharmacies":
        require_once __DIR__ . "/../../reports/vendor-report.php";
        break;

    case "inventory":
        require_once __DIR__ . "/../../reports/inventory-report.php";
        break;

    case "orders":
        require_once __DIR__ . "/../../reports/orders-report.php";
        break;

    case "audit":
        require_once __DIR__ . "/../../reports/audit-report.php";
        break;

    default:

        header("Content-Type: application/json");

        echo json_encode([
            "success" => false,
            "message" => "Invalid report type."
        ]);
}