<?php

header("Content-Type: application/json");

require_once "../../config/database.php";
require_once "../../models/User.php";

try {

    // Connect to database
    $database = new Database();
    $db = $database->connect();

    // Create User object
    $user = new User($db);

    // Get JSON data
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate required fields
    if (
        empty($data["first_name"]) ||
        empty($data["last_name"]) ||
        empty($data["email"]) ||
        empty($data["phone"]) ||
        empty($data["password"])
    ) {

        echo json_encode([
            "success" => false,
            "message" => "Please fill in all required fields."
        ]);

        exit;
    }

    $fullName = trim($data["first_name"] . " " . $data["last_name"]);
    $email = trim(strtolower($data["email"]));
    $phone = trim($data["phone"]);
    $password = $data["password"];

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid email address."
        ]);

        exit;
    }

    // Check if email exists
    if ($user->emailExists($email)) {

        echo json_encode([
            "success" => false,
            "message" => "Email already exists."
        ]);

        exit;
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Register customer
    $userId = $user->register(
        $fullName,
        $email,
        $hashedPassword,
        $phone,
        "customer",
        "active"
    );

    if ($userId) {

        echo json_encode([
            "success" => true,
            "message" => "Account created successfully."
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Registration failed."
        ]);

    }

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);

}