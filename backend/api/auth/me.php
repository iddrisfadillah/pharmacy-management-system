<?php

header("Content-Type: application/json");

require_once "../../middleware/auth.php";

echo json_encode([
    "success" => true,
    "user" => $currentUser
]);