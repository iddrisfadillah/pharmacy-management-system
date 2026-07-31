<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/response.php";

authorize(["customer"]);

$db = (new Database())->connect();

$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset($data["cart_item_id"]) ||
    !isset($data["quantity"])
) {
    jsonResponse(
        false,
        "Missing required fields.",
        null,
        400
    );
}

$cartItemId = (int)$data["cart_item_id"];
$quantity   = max(1, (int)$data["quantity"]);

$stmt = $db->prepare("
    UPDATE cart_items ci
    INNER JOIN carts c
        ON ci.cart_id = c.id
    SET ci.quantity = ?
    WHERE
        ci.id = ?
    AND
        c.customer_id = ?
");

$success = $stmt->execute([
    $quantity,
    $cartItemId,
    $currentUser["id"]
]);

jsonResponse(
    $success,
    $success
        ? "Cart updated successfully."
        : "Unable to update cart."
);