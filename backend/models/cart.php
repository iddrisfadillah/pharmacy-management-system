<?php

class Cart
{
    private PDO $conn;

    private string $cartTable = "carts";

    private string $itemTable = "cart_items";

    public function __construct(PDO $database)
    {
        $this->conn = $database;
    }

    /*
    |--------------------------------------------------------------------------
    | Get Customer Cart
    |--------------------------------------------------------------------------
    */

    public function getCart($customerId)
    {
        $sql = "SELECT *
                FROM {$this->cartTable}
                WHERE customer_id = ?
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$customerId]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Cart
    |--------------------------------------------------------------------------
    */

    public function createCart($customerId)
    {
        $sql = "INSERT INTO {$this->cartTable} (customer_id)
                VALUES (?)";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt->execute([$customerId])) {
            return false;
        }

        return $this->conn->lastInsertId();
    }

    /*
    |--------------------------------------------------------------------------
    | Get Or Create Cart
    |--------------------------------------------------------------------------
    */

    public function getOrCreateCart($customerId)
    {
        $cart = $this->getCart($customerId);

        if ($cart) {
            return $cart["id"];
        }

        return $this->createCart($customerId);
        
    }

    /*
    |--------------------------------------------------------------------------
    | Check Item Already Exists
    |--------------------------------------------------------------------------
    */

    public function getItem($cartId, $medicineId)
    {
        $sql = "SELECT *
                FROM {$this->itemTable}
                WHERE cart_id = ?
                AND medicine_id = ?
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$cartId, $medicineId]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /*
    |--------------------------------------------------------------------------
    | Add Item
    |--------------------------------------------------------------------------
    */

    public function addItem($cartId, $medicineId, $quantity = 1)
    {
        $existing = $this->getItem($cartId, $medicineId);

        if ($existing) {

            $sql = "UPDATE {$this->itemTable}
                    SET quantity = quantity + ?
                    WHERE id = ?";

            $stmt = $this->conn->prepare($sql);

            return $stmt->execute([
                $quantity,
                $existing["id"]
            ]);
        }

        $sql = "INSERT INTO {$this->itemTable}
                (
                    cart_id,
                    medicine_id,
                    quantity
                )
                VALUES
                (?, ?, ?)";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            $cartId,
            $medicineId,
            $quantity
        ]);
    }
    public function getItems($customerId)
{
    $sql = "
        SELECT
            ci.id AS cart_item_id,
            ci.quantity,

            m.id AS medicine_id,
            m.medicine_name,
            m.selling_price,
            m.image,

            p.pharmacy_name

        FROM carts c

        INNER JOIN cart_items ci
            ON ci.cart_id = c.id

        INNER JOIN medicines m
            ON m.id = ci.medicine_id

        INNER JOIN pharmacies p
            ON p.id = m.pharmacy_id

        WHERE c.customer_id = ?

        ORDER BY ci.created_at DESC
    ";

    $stmt = $this->conn->prepare($sql);

    $stmt->execute([$customerId]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
    
}