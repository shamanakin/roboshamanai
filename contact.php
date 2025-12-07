<?php
// contact.php - handles contact form submissions and sends email to matthew@roboshamanai.com

$to = 'matthew@roboshamanai.com';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}

// Honeypot spam check - if filled, it's a bot
$honeypot = trim($_POST['website'] ?? '');
if ($honeypot !== '') {
    http_response_code(400);
    exit('Spam detected.');
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$track   = trim($_POST['track'] ?? '');
$message = trim($_POST['message'] ?? '');

// Sanitize against email header injection
$name    = str_replace(["\r", "\n"], '', $name);
$email   = str_replace(["\r", "\n"], '', $email);
$track   = str_replace(["\r", "\n"], '', $track);

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    header('Location: error.html');
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    header('Location: error.html');
    exit;
}

$subject = "New RSAi inquiry: $track";
$body    = "Name: $name\nEmail: $email\nInterest: $track\n\nMessage:\n$message\n";

$headers = "From: RSAi Website <matthew@roboshamanai.com>\r\n" .
           "Reply-To: $name <$email>\r\n";

if (mail($to, $subject, $body, $headers)) {
    header('Location: thank-you.html');
    exit;
} else {
    header('Location: error.html');
    exit;
}




