<?php

class Order
{
    private $conn;
    private $table = "orders";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Create a new order
    public function create($data)
    {
        $query = "INSERT INTO {$this->table}
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
            :pharmacy_id,
            :customer_name,
            :customer_phone,
            :order_number,
            :total_amount,
            :payment_method,
            :payment_status,
            :order_status,
            :notes
        )";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ":pharmacy_id" => $data["pharmacy_id"],
            ":customer_name" => $data["customer_name"],
            ":customer_phone" => $data["customer_phone"],
            ":order_number" => $data["order_number"],
            ":total_amount" => $data["total_amount"],
            ":payment_method" => $data["payment_method"],
            ":payment_status" => $data["payment_status"],
            ":order_status" => $data["order_status"],
            ":notes" => $data["notes"]
        ]);
    }

    // Get all orders for a pharmacy
    public function getAll($pharmacyId)
    {
        $query = "SELECT *
                  FROM {$this->table}
                  WHERE pharmacy_id = ?
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([$pharmacyId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a single order
    public function getById($id, $pharmacyId)
    {
        $query = "SELECT *
                  FROM {$this->table}
                  WHERE id = ?
                  AND pharmacy_id = ?
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id, $pharmacyId]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Delete an order
    public function delete($id, $pharmacyId)
    {
        $query = "DELETE
                  FROM {$this->table}
                  WHERE id = ?
                  AND pharmacy_id = ?";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([$id, $pharmacyId]);
    }
}