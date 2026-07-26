<?php

header("Content-Type: application/json");

require_once "../../config/database.php";
require_once "../../models/User.php";
require_once "../../models/Pharmacy.php";

try {

    $database = new Database();
    $db = $database->connect();

    $user = new User($db);
    $pharmacy = new Pharmacy($db);

    // Required fields
    $required = [
        "first_name",
        "last_name",
        "email",
        "phone",
        "password",
        "pharmacy_name",
        "pharmacy_address",
        "license_number"
    ];

    foreach ($required as $field) {
        if (empty($_POST[$field])) {
            echo json_encode([
                "success" => false,
                "message" => ucfirst(str_replace("_", " ", $field)) . " is required."
            ]);
            exit;
        }
    }

    $fullName = trim($_POST["first_name"] . " " . $_POST["last_name"]);
    $email = strtolower(trim($_POST["email"]));
    $phone = trim($_POST["phone"]);
    $password = $_POST["password"];

    $pharmacyName = trim($_POST["pharmacy_name"]);
    $address = trim($_POST["pharmacy_address"]);
    $license = trim($_POST["license_number"]);
    $business = trim($_POST["business_registration"] ?? "");

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid email address."
        ]);
        exit;
    }

    if ($user->emailExists($email)) {
        echo json_encode([
            "success" => false,
            "message" => "Email already exists."
        ]);
        exit;
    }

    $logoName = null;

    if (isset($_FILES["pharmacy_logo"]) && $_FILES["pharmacy_logo"]["error"] == 0) {

        $allowed = ["jpg", "jpeg", "png"];

        $extension = strtolower(pathinfo($_FILES["pharmacy_logo"]["name"], PATHINFO_EXTENSION));

        if (!in_array($extension, $allowed)) {

            echo json_encode([
                "success" => false,
                "message" => "Only JPG and PNG images are allowed."
            ]);

            exit;
        }

        $logoName = uniqid("logo_") . "." . $extension;

        move_uploaded_file(
            $_FILES["pharmacy_logo"]["tmp_name"],
            "../../uploads/" . $logoName
        );
    }

    // Start transaction
    $db->beginTransaction();

    $userId = $user->register(
        $fullName,
        $email,
        password_hash($password, PASSWORD_DEFAULT),
        $phone,
        "pharmacist",
        "pending"
    );

    if (!$userId) {
        throw new Exception("Unable to create user.");
    }

    $saved = $pharmacy->create(
        $userId,
        $pharmacyName,
        $address,
        $license,
        $business,
        $logoName
    );

    if (!$saved) {
        throw new Exception("Unable to save pharmacy.");
    }

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Application submitted successfully. Your account is awaiting admin approval."
    ]);

} catch (Exception $e) {

    if ($db->inTransaction()) {
        $db->rollBack();
    }

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);

}