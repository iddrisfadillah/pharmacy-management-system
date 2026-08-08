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

if (!empty($from)) {
    $where .= " AND DATE(o.created_at) >= ?";
    $params[] = $from;
}

if (!empty($to)) {
    $where .= " AND DATE(o.created_at) <= ?";
    $params[] = $to;
}

$sql = "
SELECT
    o.order_number,
    o.customer_name,
    p.pharmacy_name,
    o.total_amount,
    o.payment_method,
    o.payment_status,
    o.order_status,
    o.created_at
FROM orders o
LEFT JOIN pharmacies p
ON o.pharmacy_id = p.id
$where
ORDER BY o.created_at DESC
";

$stmt = $db->prepare($sql);
$stmt->execute($params);


$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);


/*
|--------------------------------------------------------------------------
| CSV EXPORT
|--------------------------------------------------------------------------
*/

if ($format === "csv") {

    $csvHeaders = [
        "Order Number",
        "Customer",
        "Pharmacy",
        "Amount",
        "Payment Method",
        "Payment Status",
        "Order Status",
        "Date"
    ];

    $csvRows = [];

    foreach ($orders as $order) {

        $csvRows[] = [
            $order["order_number"],
            $order["customer_name"],
            $order["pharmacy_name"] ?? "-",
            $order["total_amount"],
            $order["payment_method"],
            $order["payment_status"],
            $order["order_status"],
            $order["created_at"]
        ];

    }

    ReportExporter::csv(
        "sales-report.csv",
        $csvHeaders,
        $csvRows
    );
}

$totalRevenue = 0;



foreach ($orders as $order) {
    $totalRevenue += (float)$order["total_amount"];
}

$pdf = new ReportPDF();

$pdf->createReport([
    "title" => "Marketplace Sales Report",
    "generatedBy" => "System Administrator",
    "from" => $from ?: "Beginning",
    "to" => $to ?: date("Y-m-d")
]);



// Replace manual summary with sectionTitle and summaryItem
$completed = 0;
$pending = 0;
$cancelled = 0;

foreach ($orders as $order) {

    switch (strtolower($order["order_status"])) {

        case "completed":
            $completed++;
            break;

        case "pending":
            $pending++;
            break;

        case "cancelled":
            $cancelled++;
            break;
    }
}

$pdf->addStatistics([
    "Total Orders" => count($orders),
    "Total Revenue" => $totalRevenue,
    "Completed Orders" => $completed,
    "Pending Orders" => $pending,
    "Cancelled Orders" => $cancelled
]);

// Replace table header with sectionTitle and tableHeader


$headers = [
    "Order",
    "Customer",
    "Pharmacy",
    "Amount",
    "Status"
];

$widths = [
    40,
    45,
    45,
    30,
    30
];

$rows = [];

foreach ($orders as $order) {

    $rows[] = [

        $order["order_number"],

        $order["customer_name"],

        $order["pharmacy_name"] ?? "-",

        $pdf->money($order["total_amount"]),

        $order["order_status"]

    ];
}

$pdf->addTable($headers, $rows, $widths);


$pdf->download("sales-report.pdf");
exit;