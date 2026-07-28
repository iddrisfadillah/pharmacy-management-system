<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/helpers.php";
require_once "../../utils/response.php";
require_once "../../models/Cart.php";

authorize(["customer"]);

$db = (new Database())->connect();

$cart = new Cart($db);

$customer = getAuthenticatedCustomer($db, $currentUser);

if (!$customer) {
    jsonResponse(false, "Customer not found.", null, 404);
}

$items = $cart->getItems($customer["id"]);

$total = 0;

foreach ($items as $item) {
    $total += $item["selling_price"] * $item["quantity"];
}

jsonResponse(
    true,
    "Cart retrieved successfully.",
    [
        "items" => $items,
        "total" => $total
    ]
);