<?php

class Medicine
{
    private PDO $conn;
    private string $table = "medicines";

    public function __construct(PDO $database)
    {
        $this->conn = $database;
    }

    /*
    |--------------------------------------------------------------------------
    | Create Medicine
    |--------------------------------------------------------------------------
    */

    public function create(array $data)
    {
        $sql = "INSERT INTO {$this->table}
        (
            pharmacy_id,
            category_id,
            medicine_name,
            generic_name,
            brand,
            dosage,
            form,
            strength,
            batch_number,
            manufacturer,
            expiry_date,
            purchase_price,
            selling_price,
            stock_quantity,
            minimum_stock,
            description,
            image
        )
        VALUES
        (
            :pharmacy_id,
            :category_id,
            :medicine_name,
            :generic_name,
            :brand,
            :dosage,
            :form,
            :strength,
            :batch_number,
            :manufacturer,
            :expiry_date,
            :purchase_price,
            :selling_price,
            :stock_quantity,
            :minimum_stock,
            :description,
            :image
        )";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute($data);
    }

    /*
    |--------------------------------------------------------------------------
    | Get All Medicines
    |--------------------------------------------------------------------------
    */

    public function getAll($pharmacyId)
    {
        $sql = "SELECT
                    m.*,
                    c.category_name
                FROM medicines m
                JOIN categories c
                    ON c.id = m.category_id
                WHERE
                    m.pharmacy_id = ?
                ORDER BY
                    m.created_at DESC";

        $stmt = $this->conn->prepare($sql);

        $stmt->execute([$pharmacyId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
        /*
    |--------------------------------------------------------------------------
    | Get One Medicine
    |--------------------------------------------------------------------------
    */

    public function getById($id,$pharmacyId)
    {
        $sql = "SELECT *
                FROM medicines
                WHERE
                    id=?
                AND
                    pharmacy_id=?
                LIMIT 1";

        $stmt=$this->conn->prepare($sql);

        $stmt->execute([$id,$pharmacyId]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    /*
|--------------------------------------------------------------------------
| Update Medicine
|--------------------------------------------------------------------------
*/

public function update(array $data)
{
    $sql = "UPDATE {$this->table}
            SET
                category_id = :category_id,
                medicine_name = :medicine_name,
                generic_name = :generic_name,
                brand = :brand,
                dosage = :dosage,
                form = :form,
                strength = :strength,
                batch_number = :batch_number,
                manufacturer = :manufacturer,
                expiry_date = :expiry_date,
                purchase_price = :purchase_price,
                selling_price = :selling_price,
                stock_quantity = :stock_quantity,
                minimum_stock = :minimum_stock,
                description = :description,
                image = :image,
                status = :status
            WHERE
                id = :id
            AND
                pharmacy_id = :pharmacy_id";

    $stmt = $this->conn->prepare($sql);

    return $stmt->execute($data);
}
/*
|--------------------------------------------------------------------------
| Delete Medicine
|--------------------------------------------------------------------------
*/

public function delete($id, $pharmacyId)
{
    $sql = "DELETE
            FROM {$this->table}
            WHERE id = ?
            AND pharmacy_id = ?";

    $stmt = $this->conn->prepare($sql);

    return $stmt->execute([$id, $pharmacyId]);
}
/*
|--------------------------------------------------------------------------
| Search Medicines
|--------------------------------------------------------------------------
*/

public function search($keyword, $pharmacyId)
{
    $sql = "SELECT *
            FROM {$this->table}
            WHERE
                pharmacy_id = ?
            AND
                medicine_name LIKE ?";

    $stmt = $this->conn->prepare($sql);

    $stmt->execute([
        $pharmacyId,
        "%{$keyword}%"
    ]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
/*
|--------------------------------------------------------------------------
| Low Stock Medicines
|--------------------------------------------------------------------------
*/

public function lowStock($pharmacyId)
{
    $sql = "SELECT *
            FROM {$this->table}
            WHERE
                pharmacy_id = ?
            AND
                stock_quantity <= minimum_stock";

    $stmt = $this->conn->prepare($sql);

    $stmt->execute([$pharmacyId]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
/*
|--------------------------------------------------------------------------
| Expired Medicines
|--------------------------------------------------------------------------
*/

public function expired($pharmacyId)
{
    $sql = "SELECT *
            FROM {$this->table}
            WHERE
                pharmacy_id = ?
            AND
                expiry_date < CURDATE()";

    $stmt = $this->conn->prepare($sql);

    $stmt->execute([$pharmacyId]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
/*
|--------------------------------------------------------------------------
| Check Category Ownership
|--------------------------------------------------------------------------
*/

public function categoryBelongsToPharmacy($categoryId, $pharmacyId)
{
    $sql = "SELECT id
            FROM categories
            WHERE id = ?
            AND pharmacy_id = ?
            LIMIT 1";

    $stmt = $this->conn->prepare($sql);
    $stmt->execute([$categoryId, $pharmacyId]);

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

public function getMarketplaceMedicine($id)
{
    $sql = "SELECT *
            FROM medicines
            WHERE id = ?
            LIMIT 1";

    $stmt = $this->conn->prepare($sql);
    $stmt->execute([$id]);

    return $stmt->fetch(PDO::FETCH_ASSOC);
}


}