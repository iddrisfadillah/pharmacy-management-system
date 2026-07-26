<?php

class Category
{
    private $conn;
    private $table = "categories";

    public function __construct($database)
    {
        $this->conn = $database;
    }

    public function create($pharmacyId, $categoryName, $description)
    {
        $query = "INSERT INTO {$this->table}
                  (pharmacy_id, category_name, description)
                  VALUES (?, ?, ?)";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            $pharmacyId,
            $categoryName,
            $description
        ]);
    }

    public function getAll($pharmacyId)
    {
        $query = "SELECT *
                  FROM {$this->table}
                  WHERE pharmacy_id = ?
                  ORDER BY category_name ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([$pharmacyId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

// Get a single category
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
// Update a category
public function update($id, $pharmacyId, $categoryName, $description, $status)
{
    $query = "UPDATE {$this->table}
              SET
                  category_name = ?,
                  description = ?,
                  status = ?
              WHERE
                  id = ?
              AND
                  pharmacy_id = ?";

    $stmt = $this->conn->prepare($query);

    return $stmt->execute([
        $categoryName,
        $description,
        $status,
        $id,
        $pharmacyId
    ]);
}

// delete a category
public function delete($id, $pharmacyId)
{
    $query = "DELETE
              FROM {$this->table}
              WHERE id = ?
              AND pharmacy_id = ?";

    $stmt = $this->conn->prepare($query);

    return $stmt->execute([
        $id,
        $pharmacyId
    ]);
}



}