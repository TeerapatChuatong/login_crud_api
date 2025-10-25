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

/* Method guard: อนุญาตเฉพาะ GET */
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  echo json_encode(['status' => 'error', 'message' => 'method_not_allowed']);
  exit;
}

try {
  $users = [];
  // ใช้ query เดิมของคุณได้เลย
  foreach ($dbh->query('SELECT * FROM user') as $row) {
    $users[] = [
      'id'     => (int)$row['id'],
      'fname'  => $row['fname'],
      'lname'  => $row['lname'],
      'avatar' => $row['avatar'],
      // ถ้าต้องการ field เพิ่มเติม เช่น email/role ให้เปิดคอมเมนต์ด้านล่าง
      // 'email'  => $row['email'],
      // 'role'   => $row['role'],
    ];
  }

  echo json_encode($users, JSON_UNESCAPED_UNICODE);
  $dbh = null; // ปิดการเชื่อมต่อ
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'db_error']);
}
