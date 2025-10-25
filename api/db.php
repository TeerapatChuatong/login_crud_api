<?php
header("Content-Type: application/json; charset=utf-8");

/* ------------ CORS ------------ */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = array_filter([
  'http://localhost:5173',          // dev (Vite)
  getenv('FRONTEND_ORIGIN') ?: ''   // ใส่โดเมน frontend จริงผ่าน ENV
]);

if ($origin && in_array($origin, $allowed, true)) {
  header("Access-Control-Allow-Origin: $origin");
  header("Vary: Origin");
} else {
  // เปิดกว้างชั่วคราวตอนเทส (ถ้ามี session/cookie แนะนำล็อกโดเมนจริงเท่านั้น)
  header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

/* ------------ ENV (รองรับทั้ง DB_* และตัวแปรจาก Railway: MYSQL*) ------------ */
$DB_HOST = getenv('DB_HOST') ?: getenv('MYSQLHOST') ?: '127.0.0.1';
$DB_PORT = getenv('DB_PORT') ?: getenv('MYSQLPORT') ?: '3306';
$DB_NAME = getenv('DB_NAME') ?: getenv('MYSQLDATABASE') ?: 'mydbtest2';
$DB_USER = getenv('DB_USER') ?: getenv('MYSQLUSER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: getenv('MYSQLPASSWORD') ?: '';

try {
  $pdo = new PDO(
    "mysql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME;charset=utf8mb4",
    $DB_USER,
    $DB_PASS,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
  );
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(["ok"=>false, "error"=>"DB_CONNECT_FAIL"]);
  exit;
}

/* ------------ Session ------------ */
session_set_cookie_params([
  'lifetime' => 60*60*24*7,
  'path'     => '/',
  'secure'   => true,   // Railway = HTTPS
  'httponly' => true,
  'samesite' => 'Lax'
]);
if (session_status() === PHP_SESSION_NONE) { session_start(); }

/* ------------ Helpers ------------ */
function json_ok($d=[]) { echo json_encode(["ok"=>true,"data"=>$d]); exit; }
function json_err($code,$msg='',$status=400) {
  http_response_code($status);
  echo json_encode(["ok"=>false,"error"=>$code,"message"=>$msg]);
  exit;
}

/* alias ให้โค้ดเดิมที่อ้าง $dbh */
if (!isset($dbh)) { $dbh = $pdo; }
