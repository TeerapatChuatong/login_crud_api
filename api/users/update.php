<?php
// CORS + JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

require_once __DIR__ . '/../db.php';
/* รองรับทั้ง $pdo/$dbh */
if (!isset($dbh) && isset($pdo)) { $dbh = $pdo; }

/* Method guard */
if ($_SERVER["REQUEST_METHOD"] !== "PATCH") {
  http_response_code(405);
  echo json_encode(['status' => 'error', 'message' => 'method_not_allowed']);
  exit;
}

/* รับข้อมูล */
$body = json_decode(file_get_contents("php://input"), true) ?: [];
$id     = $body['id']     ?? null;
$fname  = trim($body['fname']  ?? '');
$lname  = trim($body['lname']  ?? '');
$email  = trim($body['email']  ?? '');
$password = trim($body['password'] ??'');
$avatar = trim($body['avatar'] ?? '');

/* ตรวจข้อมูลพื้นฐาน */
if ($id === null || !is_numeric($id)) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'invalid_or_missing_id']);
  exit;
}
if ($fname === '' || $lname === '' || $email === '') {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'missing_fields']);
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'invalid_email']);
  exit;
}

try {
  /* เช็คอีเมลซ้ำ แต่ยกเว้นเรคอร์ดของตัวเอง */
  $chk = $dbh->prepare("SELECT id FROM user WHERE email = ? AND id <> ?");
  $chk->execute([$email, (int)$id]);
  if ($chk->fetch()) {
    http_response_code(409);
    echo json_encode(['status' => 'error', 'message' => 'email_exists']);
    exit;
  }

  /* avatar ว่างให้เก็บเป็น NULL */
  $avatarParam = ($avatar === '') ? null : $avatar;

  $stmt = $dbh->prepare("UPDATE user
                         SET fname = ?, lname = ?, email = ?, avatar = ?
                         WHERE id = ?");
  $ok = $stmt->execute([$fname, $lname, $email, $avatarParam, (int)$id]);

  if ($ok && $stmt->rowCount() >= 0) {
    echo json_encode(['status' => 'ok']);
  } else {
    // ถึงแม้ rowCount อาจเป็น 0 (ข้อมูลเดิมเหมือนเดิม) ก็ถือว่าไม่ error
    echo json_encode(['status' => 'ok']);
  }

  $dbh = null; // ปิดการเชื่อมต่อ
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'db_error']);
}
