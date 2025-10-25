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
if ($_SERVER["REQUEST_METHOD"] !== "DELETE") {
  http_response_code(405);
  echo json_encode(['status' => 'error', 'message' => 'method_not_allowed']);
  exit;
}

/* รับข้อมูล */
$body = json_decode(file_get_contents("php://input"), true) ?: [];
$id   = $body['id'] ?? null;

/* Validate id */
if ($id === null || !is_numeric($id)) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'invalid_or_missing_id']);
  exit;
}

try {
  $stmt = $dbh->prepare("DELETE FROM user WHERE id = ?");
  $ok   = $stmt->execute([ (int)$id ]);

  if ($ok && $stmt->rowCount() > 0) {
    echo json_encode(['status' => 'ok']);
  } else {
    // ไม่พบ id ที่จะลบ
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'not_found']);
  }

  $dbh = null; // ปิดการเชื่อมต่อ
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'db_error']);
}
