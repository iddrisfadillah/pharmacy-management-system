<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/response.php";
require_once "../../models/Cart.php";
require_once "../../models/Medicine.php";

authorize(["customer"]);

$db = (new Database())->connect();

$cart = new Cart($db);
$medicine = new Medicine($db);

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data["medicine_id"])) {
    jsonResponse(false, "Medicine ID is required.", null, 400);
}

$quantity = isset($data["quantity"])
    ? (int)$data["quantity"]
    : 1;

if ($quantity < 1) {
    $quantity = 1;
}

/*
|--------------------------------------------------------------------------
| Check medicine exists
|--------------------------------------------------------------------------
*/

$product = $medicine->getMarketplaceMedicine(
    $data["medicine_id"]
);

if (!$product) {
    jsonResponse(false, "Medicine not found.", null, 404);
}

/*
|--------------------------------------------------------------------------
| Get or create customer's cart
|--------------------------------------------------------------------------
*/

$cartId = $cart->getOrCreateCart($currentUser["id"]);

/*
|--------------------------------------------------------------------------
| Add item
|--------------------------------------------------------------------------
*/

if ($cart->addItem(
    $cartId,
    $data["medicine_id"],
    $quantity
)) {

    jsonResponse(true, "Item added to cart.");
}

jsonResponse(false, "Unable to add item.", null, 500);