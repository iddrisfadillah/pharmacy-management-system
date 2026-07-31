<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/response.php";
require_once "../../models/Cart.php";
require_once "../../models/Medicine.php";

authorize(["customer"]);

$db = (new Database())->connect();

$currentCustomer = $currentUser["id"];

//  load cart
$cart = new Cart($db);

$items = $cart->getItems($currentCustomer);

if (!$items) {
    jsonResponse(false, "Cart is empty.", null, 400);
}

// Receive checkout information

$data = json_decode(file_get_contents("php://input"), true);

$customerName = trim($data["customer_name"] ?? "");
$customerPhone = trim($data["customer_phone"] ?? "");
$paymentMethod = $data["payment_method"] ?? "Cash";
$notes = trim($data["notes"] ?? "");

if ($customerName == "") {
    jsonResponse(false, "Customer name is required.", null, 400);
}
// Calculate total
$total = 0;

foreach ($items as $item) {

    $total +=
        $item["selling_price"] *
        $item["quantity"];

}
// Generate an order number
$orderNumber =
    "ORD-" .
    date("YmdHis") .
    rand(100,999);

    try {

    $db->beginTransaction();

    // Create order
    $stmt = $db->prepare("
        INSERT INTO orders
        (
            pharmacy_id,
            customer_name,
            customer_phone,
            order_number,
            total_amount,
            payment_method,
            payment_status,
            order_status,
            notes
        )
        VALUES
        (
            ?, ?, ?, ?, ?, ?, 'Pending', 'Pending', ?
        )
    ");

    // Use the pharmacy of the first medicine in the cart
    $pharmacyId = $items[0]["pharmacy_id"];

    $stmt->execute([
        $pharmacyId,
        $customerName,
        $customerPhone,
        $orderNumber,
        $total,
        $paymentMethod,
        $notes
    ]);

    $orderId = $db->lastInsertId();

    // Save each cart item
    foreach ($items as $item) {

        $subtotal =
            $item["selling_price"] *
            $item["quantity"];

        $stmt = $db->prepare("
            INSERT INTO order_items
            (
                order_id,
                medicine_id,
                quantity,
                unit_price,
                subtotal
            )
            VALUES
            (?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $orderId,
            $item["medicine_id"],
            $item["quantity"],
            $item["selling_price"],
            $subtotal
        ]);

        // Reduce stock
        $stmt = $db->prepare("
            UPDATE medicines
            SET stock_quantity = stock_quantity - ?
            WHERE id = ?
        ");

        $stmt->execute([
            $item["quantity"],
            $item["medicine_id"]
        ]);
    }

    // Empty customer's cart
    $stmt = $db->prepare("
        DELETE ci
        FROM cart_items ci
        INNER JOIN carts c
            ON ci.cart_id = c.id
        WHERE c.customer_id = ?
    ");

    $stmt->execute([$currentCustomer]);

    $db->commit();

    jsonResponse(
        true,
        "Order placed successfully.",
        [
            "order_id" => $orderId,
            "order_number" => $orderNumber
        ]
    );

} catch (Exception $e) {

    $db->rollBack();

    jsonResponse(
        false,
        $e->getMessage(),
        null,
        500
    );


    
}