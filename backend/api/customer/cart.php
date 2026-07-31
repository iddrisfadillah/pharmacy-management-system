<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/response.php";
require_once "../../models/Cart.php";

authorize(["customer"]);

$db = (new Database())->connect();

$cart = new Cart($db);

$customerId = $currentUser["id"];

switch ($_SERVER["REQUEST_METHOD"]) {

    /*
    |--------------------------------------------------------------------------
    | GET CART
    |--------------------------------------------------------------------------
    */

    case "GET":

        $items = $cart->getItems($customerId);

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

        break;

    /*
    |--------------------------------------------------------------------------
    | ADD TO CART
    |--------------------------------------------------------------------------
    */

    case "POST":

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

        $cartId = $cart->getOrCreateCart($customerId);

        $success = $cart->addItem(
            $cartId,
            $data["medicine_id"],
            $quantity
        );

        if (!$success) {
            jsonResponse(false, "Unable to add item.", null, 500);
        }

        jsonResponse(
            true,
            "Item added to cart successfully."
        );

        break;

    default:

        jsonResponse(
            false,
            "Method not allowed.",
            null,
            405
        );

// UPDATE quantity
case "PUT":

    $data = json_decode(file_get_contents("php://input"), true);

    if (
        empty($data["cart_item_id"]) ||
        empty($data["quantity"])
    ) {
        jsonResponse(false, "Missing data.", null, 400);
    }

    $cart->updateQuantity(
        $data["cart_item_id"],
        $data["quantity"]
    );

    jsonResponse(true, "Quantity updated.");

break;

// DELETE item
case "DELETE":

    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data["cart_item_id"])) {
        jsonResponse(false, "Cart item required.", null, 400);
    }

    $cart->removeItem($data["cart_item_id"]);

    jsonResponse(true, "Item removed.");

break;



}