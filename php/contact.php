<?php

require_once 'classes/Contact.php';
$contact = new Contact();
$json    = $contact->handleRequest();
header('application/json');
echo json_encode(!empty($json) ? $json : array('idle'));
exit;
