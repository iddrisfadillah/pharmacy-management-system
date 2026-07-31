<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/helpers.php";
require_once "../../utils/response.php";
require_once "../../models/Order.php";

authorize(["pharmacist"]);

$db = (new Database())->connect();

$order = new Order($db);

$pharmacy = getAuthenticatedPharmacy($db, $currentUser);

$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data["id"]) ||
    empty($data["status"])
) {
    jsonResponse(false, "Order ID and status are required.", null, 400);
}

$allowedStatuses = [
    "Pending",
    "Processing",
    "Completed",
    "Cancelled"
];

if (!in_array($data["status"], $allowedStatuses)) {
    jsonResponse(false, "Invalid status.", null, 400);
}

$success = $order->updateStatus(
    $data["id"],
    $pharmacy["id"],
    $data["status"]
);

if ($success) {
    jsonResponse(true, "Order updated successfully.");
}

jsonResponse(false, "Unable to update order.", null, 500);