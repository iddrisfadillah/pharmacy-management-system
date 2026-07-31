<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/response.php";

authorize(["customer"]);

$db = (new Database())->connect();

$stmt = $db->prepare("
    DELETE ci
    FROM cart_items ci
    INNER JOIN carts c
        ON ci.cart_id = c.id
    WHERE c.customer_id = ?
");

$success = $stmt->execute([
    $currentUser["id"]
]);

jsonResponse(
    $success,
    $success
        ? "Cart cleared successfully."
        : "Unable to clear cart."
);