<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../utils/jwt.php";

$headers = getallheaders();

if (!isset($headers["Authorization"])) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Authorization token missing."
    ]);

    exit;
}

$token = str_replace("Bearer ", "", $headers["Authorization"]);

$currentUser = JWT::verify($token);

if (!$currentUser) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Invalid or expired token."
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Role Authorization Helper
|--------------------------------------------------------------------------
*/

function authorize($roles)
{
    global $currentUser;

    if (!in_array($currentUser["role"], $roles)) {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Access denied."
        ]);

        exit;
    }
}