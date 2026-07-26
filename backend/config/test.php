<?php

require_once "database.php";

$database = new Database();
$conn = $database->connect();

echo "✅ Database Connected Successfully";