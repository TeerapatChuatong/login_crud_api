<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../db.php';
/* รองรับทั้ง $pdo และ $dbh (กันกรณี db.php ใช้ $pdo) */
if (!isset($dbh) && isset($pdo)) { $dbh = $pdo; }

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(['status' => 'error','message'=>'method_not_allowed']);
  exit;
}

$body = json_decode(file_get_contents("php://input"), true) ?: [];

$fname    = trim($body['fname'] ?? '');
$lname    = trim($body['lname'] ?? '');
$email    = trim($body['email'] ?? '');
$avatar   = trim($body['avatar'] ?? '');
$password = trim($body['password'] ?? '');
$role     = 'user';

/* ตรวจข้อมูล */
if ($fname === '' || $lname === '' || $email === '' || $password === '') {
  http_response_code(400);
  echo json_encode(['status'=>'error','message'=>'missing_fields']); 
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['status'=>'error','message'=>'invalid_email']); 
  exit;
}
if (strlen($password) < 8) {
  http_response_code(400);
  echo json_encode(['status'=>'error','message'=>'weak_password_min_8']); 
  exit;
}

try {
  /* เช็คอีเมลซ้ำ */
  $chk = $dbh->prepare("SELECT id FROM user WHERE email = ?");
  $chk->execute([$email]);
  if ($chk->fetch()) {
    http_response_code(409);
    echo json_encode(['status'=>'error','message'=>'email_exists']); 
    exit;
  }

  $password_hash = password_hash($password, PASSWORD_BCRYPT);
  $avatarParam = ($avatar === '') ? null : $avatar;

  $stmt = $dbh->prepare("
    INSERT INTO user (fname, lname, email, avatar, password_hash, role)
    VALUES (?, ?, ?, ?, ?, ?)
  ");
  $ok = $stmt->execute([$fname, $lname, $email, $avatarParam, $password_hash, $role]);

  if ($ok) {
    http_response_code(201);
    echo json_encode([
      'status' => 'ok',
      'data' => [
        'id'    => (int)$dbh->lastInsertId(),
        'fname' => $fname,
        'lname' => $lname,
        'email' => $email,
        'role'  => $role,
        'avatar'=> $avatarParam
      ]
    ]);
  } else {
    http_response_code(500);
    echo json_encode(['status'=>'error','message'=>'insert_failed']);
  }
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['status'=>'error','message'=>'db_error']);
}
