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

$orders = $order->getAll($pharmacy["id"]);

jsonResponse(
    true,
    "Orders retrieved successfully.",
    [
        "orders" => $orders
    ]
);