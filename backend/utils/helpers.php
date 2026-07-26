<?php

require_once __DIR__ . "/../models/Pharmacy.php";
require_once __DIR__ . "/response.php";

function getAuthenticatedPharmacy(PDO $db, array $currentUser)
{
    $pharmacyModel = new Pharmacy($db);

    $pharmacy = $pharmacyModel->getByUserId($currentUser["id"]);

    if (!$pharmacy) {
        jsonResponse(
            false,
            "Pharmacy not found.",
            null,
            404
        );
    }

    return $pharmacy;
}