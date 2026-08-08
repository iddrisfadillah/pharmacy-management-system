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
    $where .= " AND DATE(p.created_at) >= ?";
    $params[] = $from;
}

if (!empty($to)) {
    $where .= " AND DATE(p.created_at) <= ?";
    $params[] = $to;
}

/*
|--------------------------------------------------------------------------
| GET VENDOR / PHARMACY DATA
|--------------------------------------------------------------------------
*/

$sql = "
SELECT
    p.id,
    p.pharmacy_name,
    p.pharmacy_address,
    p.license_number,
    p.business_registration,
    p.created_at,
    p.status AS pharmacy_status,

    u.full_name,
    u.email,
    u.phone,
    u.status AS user_status

FROM pharmacies p

LEFT JOIN users u
    ON p.user_id = u.id

$where

ORDER BY p.created_at DESC
";

$stmt = $db->prepare($sql);
$stmt->execute($params);

$vendors = $stmt->fetchAll(PDO::FETCH_ASSOC);


/*
|--------------------------------------------------------------------------
| CSV EXPORT
|--------------------------------------------------------------------------
*/

if ($format === "csv") {

    $csvHeaders = [
        "Pharmacy Name",
        "Owner",
        "Email",
        "Phone",
        "Address",
        "License Number",
        "Business Registration",
        "Pharmacy Status",
        "Account Status",
        "Registered Date"
    ];

    $csvRows = [];

    foreach ($vendors as $vendor) {

        $csvRows[] = [
            $vendor["pharmacy_name"] ?? "-",
            $vendor["full_name"] ?? "-",
            $vendor["email"] ?? "-",
            $vendor["phone"] ?? "-",
            $vendor["pharmacy_address"] ?? "-",
            $vendor["license_number"] ?? "-",
            $vendor["business_registration"] ?? "-",
            $vendor["pharmacy_status"] ?? "-",
            $vendor["user_status"] ?? "-",
            $vendor["created_at"] ?? "-"
        ];
    }

    ReportExporter::csv(
        "vendor-activity-report.csv",
        $csvHeaders,
        $csvRows
    );
}


/*
|--------------------------------------------------------------------------
| STATISTICS
|--------------------------------------------------------------------------
*/

$totalVendors = count($vendors);

$approved = 0;
$pending = 0;
$suspended = 0;

foreach ($vendors as $vendor) {

    switch (strtolower($vendor["pharmacy_status"] ?? "")) {

        case "approved":
            $approved++;
            break;

        case "pending":
            $pending++;
            break;

        case "suspended":
            $suspended++;
            break;
    }
}


/*
|--------------------------------------------------------------------------
| PDF REPORT
|--------------------------------------------------------------------------
*/

$pdf = new ReportPDF();

$pdf->createReport([
    "title" => "Vendor Activity Report",
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
    "Total Vendors" => $totalVendors,
    "Approved Vendors" => $approved,
    "Pending Vendors" => $pending,
    "Suspended Vendors" => $suspended
]);


/*
|--------------------------------------------------------------------------
| TABLE
|--------------------------------------------------------------------------
*/

$headers = [
    "Pharmacy",
    "Owner",
    "Email",
    "License",
    "Status"
];

$widths = [
    40,
    40,
    45,
    35,
    30
];

$rows = [];

foreach ($vendors as $vendor) {

    $rows[] = [

        $vendor["pharmacy_name"] ?? "-",

        $vendor["full_name"] ?? "-",

        $vendor["email"] ?? "-",

        $vendor["license_number"] ?? "-",

        $vendor["pharmacy_status"] ?? "-"
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

$pdf->download("vendor-activity-report.pdf");

exit;