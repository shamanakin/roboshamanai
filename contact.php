<?php
// contact.php - handles contact form submissions and sends email to matthew@roboshamanai.com

$to = 'matthew@roboshamanai.com';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$track   = trim($_POST['track'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    exit('Required fields missing.');
}

$subject = "New RSAi inquiry: $track";
$body    = "Name: $name\nEmail: $email\nInterest: $track\n\nMessage:\n$message\n";

$headers = "From: RSAi Website <matthew@roboshamanai.com>\r\n" .
           "Reply-To: $name <$email>\r\n";

if (mail($to, $subject, $body, $headers)) {
    header('Location: thank-you.html');
    exit;
} else {
    http_response_code(500);
    echo 'There was a problem sending your message.';
}




