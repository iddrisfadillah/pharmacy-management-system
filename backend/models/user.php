<?php

class User
{
    private $conn;

    public function __construct($database)
    {
        $this->conn = $database;
    }

    // Check if email already exists
    public function emailExists($email)
    {
        $sql = "SELECT id FROM users WHERE email = ? LIMIT 1";

        $stmt = $this->conn->prepare($sql);

        $stmt->execute([$email]);

        return $stmt->rowCount() > 0;
    }

    // NEW METHOD - Find user by email
    public function findByEmail($email)
    {
        $sql = "SELECT * FROM users WHERE email = ? LIMIT 1";

        $stmt = $this->conn->prepare($sql);

        $stmt->execute([$email]);

        return $stmt->fetch();
    }

    // Register user
    public function register($fullName, $email, $password, $phone, $role, $status)
    {
        $sql = "INSERT INTO users
                (full_name, email, password, phone, role, status)
                VALUES
                (?, ?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($sql);

        if ($stmt->execute([
            $fullName,
            $email,
            $password,
            $phone,
            $role,
            $status
        ])) {

            return $this->conn->lastInsertId();
        }

        return false;
    }
}