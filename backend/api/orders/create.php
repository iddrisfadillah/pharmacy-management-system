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

if (!$pharmacy) {
    jsonResponse(false, "Pharmacy not found.", null, 404);
}

$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data["customer_name"]) ||
    empty($data["order_number"])
) {
    jsonResponse(false, "Customer name and order number are required.", null, 400);
}

$data += [
    "customer_phone" => null,
    "total_amount" => 0,
    "payment_method" => "Cash",
    "payment_status" => "Pending",
    "order_status" => "Pending",
    "notes" => null
];

$data["pharmacy_id"] = $pharmacy["id"];

if ($order->create($data)) {
    jsonResponse(true, "Order created successfully.");
}

jsonResponse(false, "Unable to create order.", null, 500);