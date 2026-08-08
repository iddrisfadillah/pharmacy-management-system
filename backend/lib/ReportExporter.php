<?php

class ReportExporter
{
    /**
     * Export data as CSV
     *
     * @param string $filename
     * @param array $headers
     * @param array $rows
     */
    public static function csv($filename, $headers, $rows)
    {
        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename={$filename}");

        $output = fopen("php://output", "w");

        // Column headers
        fputcsv($output, $headers);

        // Data rows
        foreach ($rows as $row) {
            fputcsv($output, $row);
        }

        fclose($output);
        exit;
    }
}