<?php

header("Content-Type: application/json");

require_once "../../config/database.php";
require_once "../../models/User.php";
require_once "../../utils/jwt.php";

try {

    $database = new Database();
    $db = $database->connect();

    $user = new User($db);

    $data = json_decode(file_get_contents("php://input"), true);

    if (
        empty($data["email"]) ||
        empty($data["password"])
    ) {

        echo json_encode([
            "success" => false,
            "message" => "Email and password are required."
        ]);

        exit;
    }

    $email = strtolower(trim($data["email"]));
    $password = $data["password"];

    $account = $user->findByEmail($email);

    if (!$account) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password."
        ]);

        exit;
    }

    if (!password_verify($password, $account["password"])) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password."
        ]);

        exit;
    }

    if ($account["status"] != "active") {

        echo json_encode([
            "success" => false,
            "message" => "Your account is awaiting administrator approval."
        ]);

        exit;
    }
    
// Create JWT payload
$payload = [
    "id" => $account["id"],
    "name" => $account["full_name"],
    "email" => $account["email"],
    "role" => $account["role"],
    "status" => $account["status"],
    "exp" => time() + (60 * 60 * 24) // 24 hours
];

// Generate JWT
$token = JWT::generate($payload);

// Return login response
echo json_encode([
    "success" => true,
    "message" => "Login successful.",
    "token" => $token,
    "role" => $account["role"],
    "user" => [
        "id" => $account["id"],
        "name" => $account["full_name"],
        "email" => $account["email"],
        "role" => $account["role"],
        "status" => $account["status"]
    ]
]);

}
catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);

}