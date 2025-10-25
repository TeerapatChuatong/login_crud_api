<?php
header("Content-Type: application/json; charset=utf-8");

// CORS: ใส่โดเมน frontend/prod ของคุณ
$allowed = [
  'http://localhost:5173',
  getenv('FRONTEND_ORIGIN') ?: ''
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowed, true)) {
  header("Access-Control-Allow-Origin: $origin");
  header("Vary: Origin");
} else {
  // เปิดกว้างชั่วคราวตอนทดสอบ: (โปรดล็อกให้แคบในโปรดักชัน)
  header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ------ อ่าน ENV ------
$DB_HOST = getenv('DB_HOST') ?: '127.0.0.1';
$DB_PORT = getenv('DB_PORT') ?: '3306';
$DB_NAME = getenv('DB_NAME') ?: 'mydbtest2';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';

try {
  $pdo = new PDO(
    "mysql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME;charset=utf8mb4",
    $DB_USER, $DB_PASS,
    [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]
  );
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok"=>false, "error"=>"DB_CONNECT_FAIL"]); exit;
}

// Session cookie — เปิด Secure บน HTTPS (Railway เป็น HTTPS)
session_set_cookie_params([
  'lifetime'=> 60*60*24*7,
  'path'    => '/',
  'secure'  => true,     // Railway = HTTPS
  'httponly'=> true,
  'samesite'=> 'Lax'
]);
if (session_status() === PHP_SESSION_NONE) session_start();

// Helpers
function json_ok($d=[]){ echo json_encode(["ok"=>true,"data"=>$d]); exit; }
function json_err($code,$msg='',$status=400){ http_response_code($status); echo json_encode(["ok"=>false,"error"=>$code,"message"=>$msg]); exit; }

// alias ให้ไฟล์เดิม
if (!isset($dbh)) { $dbh = $pdo; }
