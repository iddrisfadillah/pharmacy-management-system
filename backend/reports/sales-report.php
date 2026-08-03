<?php

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../lib/ReportPDF.php";

$db = (new Database())->connect();

$from = $_GET["from"] ?? "";
$to = $_GET["to"] ?? "";

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

$totalRevenue = 0;

foreach ($orders as $order) {
    $totalRevenue += (float)$order["total_amount"];
}

$pdf = new ReportPDF();

$pdf = new ReportPDF();

$pdf->AliasNbPages();

$pdf->reportTitle = "Marketplace Sales Report";

$pdf->AddPage();

$pdf->reportInfo(
    $from ?: "Beginning",
    $to ?: date("Y-m-d"),
    "System Administrator"
);



// Replace manual summary with sectionTitle and summaryItem
$pdf->sectionTitle("Report Summary");

$pdf->summaryItem("Total Orders", count($orders));

$pdf->summaryItem(
    "Total Revenue",
    " GH₵ " . number_format($totalRevenue, 2)
);

// Replace table header with sectionTitle and tableHeader
$pdf->Ln(5);

$pdf->sectionTitle("Order Details");

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

$pdf->tableHeader($headers, $widths);

// Replace the loop with tableRow
foreach ($orders as $order) {
    $pdf->tableRow(
        [
            $order["order_number"],
            $order["customer_name"],
            $order["pharmacy_name"] ?? "-",
            " GH₵ " . number_format($order["total_amount"], 2),
            $order["order_status"]
        ],
        $widths
    );
}

$pdf->Output("D", "sales-report.pdf");
exit;