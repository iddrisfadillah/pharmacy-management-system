<?php

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../lib/ReportPDF.php";
require_once __DIR__ . "/../lib/ReportExporter.php";

$db = (new Database())->connect();

$from = $_GET["from"] ?? "";
$to = $_GET["to"] ?? "";
$format = strtolower($_GET["format"] ?? "pdf");

$where = "WHERE 1=1";
$params = [];


/*
|--------------------------------------------------------------------------
| DATE FILTER
|--------------------------------------------------------------------------
*/

if (!empty($from)) {
    $where .= " AND DATE(created_at) >= ?";
    $params[] = $from;
}

if (!empty($to)) {
    $where .= " AND DATE(created_at) <= ?";
    $params[] = $to;
}


/*
|--------------------------------------------------------------------------
| GET USERS
|--------------------------------------------------------------------------
*/

$sql = "
SELECT
    full_name,
    email,
    role,
    status,
    created_at
FROM users
$where
ORDER BY created_at DESC
";

$stmt = $db->prepare($sql);
$stmt->execute($params);

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);


/*
|--------------------------------------------------------------------------
| STATISTICS
|--------------------------------------------------------------------------
*/

$totalUsers = count($users);

$customers = 0;
$pharmacists = 0;
$admins = 0;

$active = 0;
$pending = 0;
$blocked = 0;

foreach ($users as $user) {

    switch (strtolower($user["role"] ?? "")) {

        case "customer":
            $customers++;
            break;

        case "pharmacist":
            $pharmacists++;
            break;

        case "admin":
            $admins++;
            break;
    }

    switch (strtolower($user["status"] ?? "")) {

        case "active":
            $active++;
            break; 

        case "pending":
            $pending++;
            break;

        case "blocked":
            $blocked++;
            break;
    }
}


/*
|--------------------------------------------------------------------------
| CSV EXPORT
|--------------------------------------------------------------------------
|
| IMPORTANT:
| CSV must exit before any PDF output is generated.
|
|--------------------------------------------------------------------------
*/

if ($format === "csv") {

    $csvHeaders = [
        "Full Name",
        "Email",
        "Role",
        "Status",
        "Joined"
    ];

    $csvRows = [];

    foreach ($users as $user) {

        $csvRows[] = [

            $user["full_name"] ?? "-",

            $user["email"] ?? "-",

            ucfirst($user["role"] ?? "-"),

            ucfirst($user["status"] ?? "-"),

            $user["created_at"] ?? "-"
        ];
    }

    ReportExporter::csv(
        "users-report.csv",
        $csvHeaders,
        $csvRows
    );

    exit;
}


/*
|--------------------------------------------------------------------------
| PDF REPORT
|--------------------------------------------------------------------------
*/

$pdf = new ReportPDF();

$pdf->createReport([
    "title" => "User Signups Report",
    "generatedBy" => "System Administrator",
    "from" => $from ?: "Beginning",
    "to" => $to ?: date("Y-m-d")
]);


/*
|--------------------------------------------------------------------------
| STATISTICS
|--------------------------------------------------------------------------
*/

$pdf->addStatistics([

    "Total Users" => $totalUsers,

    "Customers" => $customers,

    "Pharmacists" => $pharmacists,

    "Administrators" => $admins,

    "Active Users" => $active,

    "Pending Users" => $pending,

    "Blocked Users" => $blocked
]);


/*
|--------------------------------------------------------------------------
| USERS TABLE
|--------------------------------------------------------------------------
*/

$headers = [
    "Name",
    "Email",
    "Role",
    "Status",
    "Joined"
];

$widths = [
    50,
    60,
    25,
    25,
    30
];

$rows = [];

foreach ($users as $user) {

    $rows[] = [

        $user["full_name"] ?? "-",

        $user["email"] ?? "-",

        ucfirst($user["role"] ?? "-"),

        ucfirst($user["status"] ?? "-"),

        !empty($user["created_at"])
            ? date("d M Y", strtotime($user["created_at"]))
            : "-"
    ];
}

$pdf->addTable(
    $headers,
    $rows,
    $widths
);


/*
|--------------------------------------------------------------------------
| DOWNLOAD PDF
|--------------------------------------------------------------------------
*/

$pdf->download("users-report.pdf");

exit;