<?php

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../lib/ReportPDF.php";

$db = (new Database())->connect();

$from = $_GET["from"] ?? "";
$to   = $_GET["to"] ?? "";

$format = strtolower($_GET["format"] ?? "pdf");
    
$where = "WHERE 1=1";
$params = [];

if($from!=""){
    $where .= " AND DATE(p.created_at) >= ?";
    $params[] = $from;
}

if($to!=""){
    $where .= " AND DATE(p.created_at) <= ?";
    $params[] = $to;
}

$sql = "

SELECT

p.pharmacy_name,
p.status,
p.created_at,
u.full_name,
u.email

FROM pharmacies p

LEFT JOIN users u
ON p.user_id=u.id

$where

ORDER BY p.created_at DESC

";

$stmt = $db->prepare($sql);
$stmt->execute($params);

$vendors = $stmt->fetchAll(PDO::FETCH_ASSOC);
$total = count($vendors);

$approved = 0;
$pending = 0;
$suspended = 0;

foreach($vendors as $vendor){

    if($vendor["status"]=="approved")
        $approved++;

    if($vendor["status"]=="pending")
        $pending++;

    if($vendor["status"]=="suspended")
        $suspended++;
}
$pdf = new ReportPDF();

$pdf->AliasNbPages();

$pdf->reportTitle = "Vendor Activity Report";

$pdf->AddPage();

$pdf->reportInfo(
    $from ?: "Beginning",
    $to ?: date("Y-m-d"),
    "System Administrator"
);
$pdf->sectionTitle("Report Summary");

$pdf->summaryItem("Total Vendors",$total);

$pdf->summaryItem("Approved Vendors",$approved);

$pdf->summaryItem("Pending Vendors",$pending);

$pdf->summaryItem("Suspended Vendors",$suspended);
$pdf->Ln(4);

$pdf->sectionTitle("Vendor Details");

$headers = [
    "Pharmacy",
    "Owner",
    "Status",
    "Joined"
];

$widths = [
    60,
    55,
    35,
    40
];

$pdf->tableHeader($headers,$widths);

foreach($vendors as $vendor){

$pdf->tableRow([

$vendor["pharmacy_name"],

$vendor["full_name"],

ucfirst($vendor["status"]),

date("d M Y",strtotime($vendor["created_at"]))

],$widths);

}
$pdf->Output("D","vendor-report.pdf");
exit;