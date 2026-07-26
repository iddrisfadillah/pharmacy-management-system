<?php

class Pharmacy
{
    private $conn;

    public function __construct($database)
    {
        $this->conn = $database;
    }

    public function create(
        $userId,
        $pharmacyName,
        $address,
        $licenseNumber,
        $businessRegistration,
        $logo
    ) {

        $sql = "INSERT INTO pharmacies
        (
            user_id,
            pharmacy_name,
            pharmacy_address,
            license_number,
            business_registration,
            logo
        )
        VALUES
        (?, ?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            $userId,
            $pharmacyName,
            $address,
            $licenseNumber,
            $businessRegistration,
            $logo
        ]);
    }


    public function getByUserId($userId)
{
    $query = "SELECT *
              FROM pharmacies
              WHERE user_id = ?
              LIMIT 1";

    $stmt = $this->conn->prepare($query);
    $stmt->execute([$userId]);

    return $stmt->fetch(PDO::FETCH_ASSOC);
}
}