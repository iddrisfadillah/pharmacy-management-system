<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";
require_once "../../config/database.php";
require_once "../../utils/response.php";

authorize(["admin"]);

$db = (new Database())->connect();

$stmt = $db->prepare("
    SELECT
        id,
        full_name,
        email,
        phone,
        role,
        status,
        created_at
    FROM users
    ORDER BY created_at DESC
");

$stmt->execute();

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

jsonResponse(true, "Users loaded", $users);