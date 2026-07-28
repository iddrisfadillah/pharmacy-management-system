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

function getAuthenticatedCustomer(PDO $db, array $currentUser)
{
    // Lazy load Customer model only when this function is called
    $customerPath = __DIR__ . "/../models/Customer.php";
    if (file_exists($customerPath)) {
        require_once $customerPath;
    } else {
        jsonResponse(false, "Customer model file missing.", null, 500);
    }

    $customerModel = new Customer($db);

    $customer = $customerModel->getByUserId($currentUser["id"]);

    if (!$customer) {
        jsonResponse(
            false,
            "Customer not found.",
            null,
            404
        );
    }

    return $customer;
}