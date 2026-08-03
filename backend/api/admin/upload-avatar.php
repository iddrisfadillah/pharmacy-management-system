<?php

header("Content-Type: application/json");

require_once "../../config/database.php";
require_once "../../middleware/auth.php";

global $currentUser;
$user = $currentUser;

if (!isset($_FILES["avatar"])) {
    echo json_encode([
        "success" => false,
        "message" => "No image uploaded."
    ]);
    exit;
}

$file = $_FILES["avatar"];

$allowed = ["image/jpeg","image/png"];

if (!in_array($file["type"], $allowed)) {

    echo json_encode([
        "success"=>false,
        "message"=>"Only JPG and PNG are allowed."
    ]);
    exit;
}

if ($file["size"] > 2 * 1024 * 1024) {

    echo json_encode([
        "success"=>false,
        "message"=>"Image must be under 2MB."
    ]);
    exit;
}

$extension = pathinfo($file["name"], PATHINFO_EXTENSION);

$filename = "admin_" . $user["id"] . "_" . time() . "." . $extension;

$uploadDir = "../../../uploads/avatars/";

if (!is_dir($uploadDir)) {
    mkdir($uploadDir,0777,true);
}

$target = $uploadDir . $filename;

move_uploaded_file($file["tmp_name"], $target);

$db = (new Database())->connect();

$stmt = $db->prepare("
UPDATE users
SET avatar=?
WHERE id=?
");

$stmt->execute([
    $filename,
    $user["id"]
]);

echo json_encode([
    "success"=>true,
    "message"=>"Avatar uploaded successfully.",
    "avatar"=>$filename
]);