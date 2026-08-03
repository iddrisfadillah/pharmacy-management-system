<?php

require_once __DIR__ . "/backend/lib/fpdf/fpdf.php";

$pdf = new FPDF();

$pdf->AddPage();

$pdf->SetFont("Arial", "B", 20);

$pdf->Cell(0, 10, "Hello World");

$pdf->Output();